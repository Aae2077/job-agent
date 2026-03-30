import Anthropic from "@anthropic-ai/sdk";
import type { Job, Message, Profile } from "./supabase";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildProfileContext(profile: Profile | null): string {
  let ctx = "";
  if (profile?.resume_text) ctx += `\n\n## User Background\n${profile.resume_text}`;
  if (profile?.skills) ctx += `\n\n## Skills\n${profile.skills}`;
  if (profile?.preferences) ctx += `\n\n## Job Preferences\n${profile.preferences}`;
  return ctx;
}

export function buildSystemPrompt(profile: Profile | null, job?: Job | null): string {
  let prompt = `You are a job search assistant helping a user manage their job applications and career. You help draft cover letters, short application notes, interview prep answers, and email responses. Be concise, direct, and tailored to the specific role when job context is provided.`;

  prompt += buildProfileContext(profile);

  if (job) {
    prompt += `\n\n## Current Job Context\nThe user is reviewing this role:\n**${job.title}** at **${job.company}**`;
    if (job.url) prompt += `\nURL: ${job.url}`;
    if (job.description) prompt += `\n\n${job.description}`;
    if (job.notes) prompt += `\n\n## User Notes on This Job\n${job.notes}`;
  }

  return prompt;
}

export function buildInterviewPrepPrompt(profile: Profile | null, job: Job | null): string {
  let prompt = `You are an expert interview coach conducting a live practice session. Help the candidate articulate their experiences using the STAR method (Situation, Task, Action, Result).

Session structure:
1. Start with a brief company and role overview (2-3 sentences max) to orient the candidate
2. Ask one targeted interview question at a time — mix behavioral, situational, role-specific, and motivation questions
3. After the candidate responds, give a polished STAR reformulation. Begin it with "**Here's that as a STAR response:**"
4. Note one specific strength (1 sentence), then move to the next question
5. Vary question types. Do not repeat question themes.
6. After 5-6 questions, give a brief session summary with the top 2-3 themes to emphasize in the real interview.

Keep responses focused. Be warm and specific. This is practice, not performance.`;

  prompt += buildProfileContext(profile);

  if (job) {
    prompt += `\n\n## Role Being Practiced For\n**${job.title}** at **${job.company}**`;
    if (job.description) {
      prompt += `\n\n${job.description.slice(0, 3000)}`;
    } else {
      prompt += `\n\nNo job description available — ask general questions relevant to a ${job.title} role.`;
    }
    if (job.notes) prompt += `\n\n## Candidate's Notes on This Role\n${job.notes}`;
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
