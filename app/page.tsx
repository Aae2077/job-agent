"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Job, type JobStatus } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLUMNS: { key: JobStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", company: "", url: "", description: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    setJobs(data ?? []);
    setLoading(false);
  }

  async function addJob() {
    if (!newJob.title || !newJob.company || adding) return;
    setAdding(true);
    await supabase.from("jobs").insert({ ...newJob, status: "new" });
    setNewJob({ title: "", company: "", url: "", description: "" });
    setShowAdd(false);
    setAdding(false);
    fetchJobs();
  }

  const jobsByStatus = (status: JobStatus) => jobs.filter((j) => j.status === status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Job Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{jobs.length} jobs tracked</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-3.5 w-3.5" />
          Add Job
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-6 p-5 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Add Job Manually</h2>
            <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2.5">
            <Input
              placeholder="Job title *"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
            />
            <Input
              placeholder="Company *"
              value={newJob.company}
              onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
            />
            <Input
              placeholder="URL"
              value={newJob.url}
              onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
            />
            <Textarea
              placeholder="Job description (paste here for AI assistance)"
              rows={4}
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
            />
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={addJob} disabled={adding || !newJob.title || !newJob.company}>
                {adding ? "Adding..." : "Add Job"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Loading jobs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATUS_COLUMNS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 leading-none">
                  {jobsByStatus(key).length}
                </span>
              </div>
              <div className="space-y-2 min-h-[80px]">
                {jobsByStatus(key).map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <Card className="p-3 hover:border-blue-500/40 hover:bg-accent/30 transition-all cursor-pointer group">
                      <div className="text-sm font-medium leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                        {job.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">{job.company}</div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={key as any} className="text-[10px] px-1.5 py-0">
                          {label}
                        </Badge>
                        {job.url && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
