import Anthropic from "@anthropic-ai/sdk";
import type { Job, Message, Profile } from "./supabase";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function buildSystemPrompt(profile: Profile | null, job?: Job | null): string {
  let prompt = `You are a job search assistant helping a user manage their job applications and career. You help draft cover letters, short application notes, interview prep answers, and email responses. Be concise, direct, and tailored to the specific role when job context is provided.`;

  if (profile?.resume_text) {
    prompt += `\n\n## User Background\n${profile.resume_text}`;
  }
  if (profile?.skills) {
    prompt += `\n\n## Skills\n${profile.skills}`;
  }
  if (profile?.preferences) {
    prompt += `\n\n## Job Preferences\n${profile.preferences}`;
  }

  if (job) {
    prompt += `\n\n## Current Job Context\nThe user is reviewing this role:\n**${job.title}** at **${job.company}**`;
    if (job.url) prompt += `\nURL: ${job.url}`;
    if (job.description) prompt += `\n\n${job.description}`;
    if (job.notes) prompt += `\n\n## User Notes on This Job\n${job.notes}`;
  }

  return prompt;
}

export async function streamChat(
  messages: Message[],
  systemPrompt: string,
  onChunk: (text: string) => void
): Promise<string> {
  let fullResponse = "";

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      fullResponse += chunk.delta.text;
      onChunk(chunk.delta.text);
    }
  }

  return fullResponse;
}
