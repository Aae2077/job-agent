import { describe, it, expect, vi } from "vitest";

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { stream: vi.fn() };
  },
}));

import { buildSystemPrompt, buildInterviewPrepPrompt } from "@/lib/claude";
import type { Profile, Job } from "@/lib/supabase";

const baseProfile: Profile = {
  id: "default",
  resume_text: "5 years in sales at Acme Corp",
  skills: "Python, Salesforce, cold calling",
  preferences: "Looking for SDR roles at AI companies",
};

describe("buildSystemPrompt", () => {
  it("includes baseline assistant instructions", () => {
    const prompt = buildSystemPrompt(null);
    expect(prompt).toContain("job search assistant");
  });

  it("includes profile resume when provided", () => {
    const prompt = buildSystemPrompt(baseProfile);
    expect(prompt).toContain("5 years in sales at Acme Corp");
  });

  it("includes skills and preferences from profile", () => {
    const prompt = buildSystemPrompt(baseProfile);
    expect(prompt).toContain("Python, Salesforce, cold calling");
    expect(prompt).toContain("Looking for SDR roles at AI companies");
  });

  it("includes job title and company when job is provided", () => {
    const job: Job = {
      id: "1",
      title: "SDR",
      company: "Anthropic",
      url: null,
      description: null,
      source: "linkedin",
      status: "new",
      notes: null,
      created_at: new Date().toISOString(),
    };
    const prompt = buildSystemPrompt(baseProfile, job);
    expect(prompt).toContain("SDR");
    expect(prompt).toContain("Anthropic");
  });

  it("omits job section when no job is provided", () => {
    const prompt = buildSystemPrompt(baseProfile, null);
    expect(prompt).not.toContain("Current Job Context");
  });

  it("includes job notes when present", () => {
    const job: Job = {
      id: "2",
      title: "AE",
      company: "Stripe",
      url: null,
      description: null,
      source: null,
      status: "applied",
      notes: "Great culture, fast growth",
      created_at: new Date().toISOString(),
    };
    const prompt = buildSystemPrompt(null, job);
    expect(prompt).toContain("Great culture, fast growth");
  });

  it("handles null profile gracefully", () => {
    expect(() => buildSystemPrompt(null)).not.toThrow();
  });
});

describe("buildInterviewPrepPrompt", () => {
  const prepJob: Job = {
    id: "3",
    title: "SDR",
    company: "Anthropic",
    url: null,
    description: "We are looking for an SDR to drive outbound pipeline.",
    source: "linkedin",
    status: "interviewing",
    notes: null,
    created_at: new Date().toISOString(),
  };

  it("includes interview coach instructions", () => {
    const prompt = buildInterviewPrepPrompt(null, null);
    expect(prompt).toContain("STAR");
    expect(prompt).toContain("interview coach");
  });

  it("includes profile background when provided", () => {
    const prompt = buildInterviewPrepPrompt(baseProfile, null);
    expect(prompt).toContain("5 years in sales at Acme Corp");
    expect(prompt).toContain("Python, Salesforce, cold calling");
  });

  it("includes job title and company when provided", () => {
    const prompt = buildInterviewPrepPrompt(null, prepJob);
    expect(prompt).toContain("SDR");
    expect(prompt).toContain("Anthropic");
  });

  it("includes job description (truncated to 3000 chars)", () => {
    const prompt = buildInterviewPrepPrompt(null, prepJob);
    expect(prompt).toContain("outbound pipeline");
  });

  it("uses fallback text when job description is null", () => {
    const jobNoDesc: Job = { ...prepJob, description: null };
    const prompt = buildInterviewPrepPrompt(null, jobNoDesc);
    expect(prompt).toContain("No job description available");
    expect(prompt).toContain("SDR");
  });

  it("handles null profile gracefully", () => {
    expect(() => buildInterviewPrepPrompt(null, prepJob)).not.toThrow();
  });

  it("handles null job gracefully", () => {
    expect(() => buildInterviewPrepPrompt(baseProfile, null)).not.toThrow();
  });
});
