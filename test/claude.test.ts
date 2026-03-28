import { describe, it, expect, vi } from "vitest";

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { stream: vi.fn() };
  },
}));

import { buildSystemPrompt } from "@/lib/claude";
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
