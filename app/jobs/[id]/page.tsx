"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase, type Job, type JobStatus, type Message } from "@/lib/supabase";

const STATUSES: JobStatus[] = ["new", "saved", "applied", "interviewing", "offer", "rejected"];

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [notes, setNotes] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchJob();
    loadConversation();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchJob() {
    const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
    if (data) {
      setJob(data);
      setNotes(data.notes ?? "");
    }
  }

  async function loadConversation() {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) {
      setConvId(data.id);
      setMessages(data.messages ?? []);
    }
  }

  async function updateStatus(status: JobStatus) {
    await supabase.from("jobs").update({ status }).eq("id", id);
    setJob((j) => j ? { ...j, status } : j);
  }

  async function saveNotes() {
    await supabase.from("jobs").update({ notes }).eq("id", id);
  }

  async function sendMessage() {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages, jobId: id }),
    });

    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      full += chunk;
      setMessages([...newMessages, { role: "assistant", content: full }]);
    }

    setStreaming(false);
    const finalMessages = [...newMessages, { role: "assistant", content: full }];

    // Persist conversation
    if (convId) {
      await supabase.from("conversations").update({ messages: finalMessages }).eq("id", convId);
    } else {
      const { data } = await supabase
        .from("conversations")
        .insert({ job_id: id, messages: finalMessages })
        .select()
        .single();
      if (data) setConvId(data.id);
    }
  }

  if (!job) return <p className="text-gray-500 text-sm">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">
        ← Back to board
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">{job.title}</h1>
            <p className="text-gray-400">{job.company}</p>
            {job.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline">
                View posting ↗
              </a>
            )}
          </div>

          {/* Status selector */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Status</label>
            <div className="flex flex-wrap gap-1">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`text-xs px-2 py-1 rounded capitalize ${
                    job.status === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Notes</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm resize-none"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Your notes about this job..."
            />
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Job Description</label>
              <div className="bg-gray-900 border border-gray-800 rounded p-3 text-sm text-gray-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="flex flex-col h-[600px] bg-gray-900 rounded-lg border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800 text-sm font-medium">
            AI Assistant
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-gray-600">
                Ask me to draft a cover letter, short note, or help you prep for this role.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
                <span
                  className={`inline-block px-3 py-2 rounded-lg max-w-[85%] text-left whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-200"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-gray-800 flex gap-2">
            <textarea
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="Ask about this job..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm px-3 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
