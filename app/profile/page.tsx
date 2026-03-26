"use client";

import { useEffect, useState } from "react";
import { supabase, type Profile } from "@/lib/supabase";

// Single-user: we use a fixed profile row with id = 'default'
const PROFILE_ID = "default";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({
    resume_text: "",
    skills: "",
    preferences: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("id", PROFILE_ID).single();
    if (data) setProfile(data);
  }

  async function saveProfile() {
    await supabase
      .from("profiles")
      .upsert({ id: PROFILE_ID, ...profile })
      .eq("id", PROFILE_ID);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Your Profile</h1>
      <p className="text-sm text-gray-500 mb-6">
        This background is injected into every AI conversation so it can personalize its responses.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Resume / Background</label>
          <p className="text-xs text-gray-500 mb-2">Paste your resume text, a bio, or a summary of your experience.</p>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm resize-none"
            rows={10}
            value={profile.resume_text ?? ""}
            onChange={(e) => setProfile({ ...profile, resume_text: e.target.value })}
            placeholder="Paste your resume or work history here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Key Skills</label>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm resize-none"
            rows={3}
            value={profile.skills ?? ""}
            onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
            placeholder="e.g. Sales, Python, TypeScript, Claude API, customer success..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job Preferences</label>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm resize-none"
            rows={3}
            value={profile.preferences ?? ""}
            onChange={(e) => setProfile({ ...profile, preferences: e.target.value })}
            placeholder="e.g. Looking for sales or technical roles at AI/dev tools companies. Prefer SF or remote. Targeting SDR/AE or growth roles."
          />
        </div>

        <button
          onClick={saveProfile}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded"
        >
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
