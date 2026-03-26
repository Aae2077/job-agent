"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Job, type JobStatus } from "@/lib/supabase";

const STATUS_COLUMNS: { key: JobStatus; label: string; color: string }[] = [
  { key: "new", label: "New", color: "bg-blue-900/40 border-blue-700" },
  { key: "saved", label: "Saved", color: "bg-purple-900/40 border-purple-700" },
  { key: "applied", label: "Applied", color: "bg-yellow-900/40 border-yellow-700" },
  { key: "interviewing", label: "Interviewing", color: "bg-orange-900/40 border-orange-700" },
  { key: "offer", label: "Offer", color: "bg-green-900/40 border-green-700" },
  { key: "rejected", label: "Rejected", color: "bg-red-900/40 border-red-700" },
];

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", company: "", url: "", description: "" });

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
    if (!newJob.title || !newJob.company) return;
    await supabase.from("jobs").insert({
      ...newJob,
      status: "new",
    });
    setNewJob({ title: "", company: "", url: "", description: "" });
    setShowAdd(false);
    fetchJobs();
  }

  const jobsByStatus = (status: JobStatus) => jobs.filter((j) => j.status === status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Job Board</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded"
        >
          + Add Job
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700 max-w-lg">
          <h2 className="text-sm font-medium mb-3">Add Job Manually</h2>
          <div className="space-y-2">
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm"
              placeholder="Job title *"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
            />
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm"
              placeholder="Company *"
              value={newJob.company}
              onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
            />
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm"
              placeholder="URL"
              value={newJob.url}
              onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
            />
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm"
              placeholder="Job description (paste here for AI assistance)"
              rows={4}
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
            />
            <div className="flex gap-2">
              <button onClick={addJob} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded">
                Add
              </button>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white text-sm px-3 py-1.5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATUS_COLUMNS.map(({ key, label, color }) => (
            <div key={key} className={`rounded-lg border p-3 ${color}`}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-gray-300">
                {label} <span className="text-gray-500">({jobsByStatus(key).length})</span>
              </div>
              <div className="space-y-2">
                {jobsByStatus(key).map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block bg-gray-900 rounded p-2 hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-sm font-medium truncate">{job.title}</div>
                    <div className="text-xs text-gray-400 truncate">{job.company}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
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
