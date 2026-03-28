"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, User } from "lucide-react";

const DEFAULT_RESUME = `UC Santa Cruz, 4th year CS major (B.A.), graduating June 2026.

Experience:
- Automation Engineer, Cush Real Estate (Jun 2025–present)
  Led RealScout CRM platform transition and onboarded 10+ agents. Automated lead routing (90% time reduction). Built follow-up workflow that increased agent compliance by 35%. Deliver daily analytics briefs to founders translating metrics into business recommendations.

- Sales Engineering Intern, Shockproof (May 2025)
  Built 50-email/day outreach automation from 3,000+ contact list. Navigated complex org structures at banks to reach decision-makers. Cold calling experience.

Leadership:
- Executive Vice President, Alpha Kappa Psi (AKPsi), Chi Gamma Chapter — current. Previously VP of Member Integration.

Key narrative: "I've been on the buying side of a sales engineer interaction. I evaluated RealScout, recommended it to leadership, and led the full rollout for 10+ agents. That experience made me want to do this full-time."`;

const DEFAULT_SKILLS = `Sales outreach automation, CRM platforms (RealScout, HubSpot), workflow automation, B2B prospecting, cold calling, technical demos, Python, JavaScript/TypeScript, Next.js, Supabase, Claude API, data analysis, translating technical concepts for non-technical buyers`;

const DEFAULT_PREFERENCES = `Target roles: SDR, BDR, Sales Engineering, Solutions Engineering, Account Executive (entry), GTM roles at AI/automation/SaaS companies.

Location: SF Bay Area — East Bay and Santa Cruz base. Happy to be in-person in SF.

Target comp: $70–90k base with clear path to $100k+.

Industry preference: AI, automation, real estate tech, SaaS.

Cover letter style: Story-driven, leads with genuine company interest. Strong closer with a logistics/availability line. Best when it tells a specific story rather than listing accomplishments formulaically.`;

export default function ProfilePage() {
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setResumeText(data.resume_text || DEFAULT_RESUME);
        setSkills(data.skills || DEFAULT_SKILLS);
        setPreferences(data.preferences || DEFAULT_PREFERENCES);
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_text: resumeText, skills, preferences }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <h1 className="text-xl font-semibold">Your Profile</h1>
        </div>
        <Button size="sm" onClick={save} disabled={saving}>
          {saved ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved
            </>
          ) : saving ? "Saving..." : "Save profile"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        This is your background. The AI reads this every time you chat — the richer this is, the better your cover letters and interview prep will be.
      </p>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Background & Experience</CardTitle>
            <p className="text-xs text-muted-foreground">Your resume, work history, education, and key narratives</p>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="font-mono text-xs leading-relaxed resize-y"
              placeholder="Paste your resume or describe your background..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Skills</CardTitle>
            <p className="text-xs text-muted-foreground">Tools, technologies, and capabilities worth highlighting</p>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="text-sm leading-relaxed resize-y"
              placeholder="e.g. Salesforce, cold calling, Python, technical demos..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Job Preferences</CardTitle>
            <p className="text-xs text-muted-foreground">Target roles, location, comp, industries, and style notes for cover letters</p>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={6}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="text-sm leading-relaxed resize-y"
              placeholder="e.g. SDR/BDR at SaaS companies, SF Bay Area, $80k+..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-1">
          <Button onClick={save} disabled={saving}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </>
            ) : saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
