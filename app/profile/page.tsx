"use client";

import { useEffect, useState } from "react";
import { supabase, type Profile } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

const PROFILE_ID = "default";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({
    resume_text: "",
    skills: "",
    preferences: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("id", PROFILE_ID).single();
    if (data) setProfile(data);
  }

  async function saveProfile() {
    setSaving(true);
    await supabase
      .from("profiles")
      .upsert({ id: PROFILE_ID, ...profile })
      .eq("id", PROFILE_ID);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Your Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This background is injected into every AI conversation so Claude can personalize its responses.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resume / Background</CardTitle>
            <CardDescription>
              Paste your resume text, a bio, or a summary of your experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={10}
              value={profile.resume_text ?? ""}
              onChange={(e) => setProfile({ ...profile, resume_text: e.target.value })}
              placeholder="Paste your resume or work history here..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Key Skills</CardTitle>
            <CardDescription>A list of your technical and professional skills.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={3}
              value={profile.skills ?? ""}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
              placeholder="e.g. Sales, Python, TypeScript, Claude API, customer success..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Job Preferences</CardTitle>
            <CardDescription>What you're targeting -- helps Claude give better recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={3}
              value={profile.preferences ?? ""}
              onChange={(e) => setProfile({ ...profile, preferences: e.target.value })}
              placeholder="e.g. Looking for sales or technical roles at AI/dev tools companies. Prefer SF or remote. Targeting SDR/AE or growth roles."
            />
          </CardContent>
        </Card>

        <Button onClick={saveProfile} disabled={saving}>
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </>
          ) : saving ? (
            "Saving..."
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </div>
  );
}
