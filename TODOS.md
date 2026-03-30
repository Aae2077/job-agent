# TODOS

## P1 — High Priority

## P2 — Medium Priority

### Post-interview debrief mode
**What:** After a job moves from `interviewing` to `rejected` (or `offer`), the chat prompts: "How do you think the interview went? What questions were hard?" — stores the debrief, improves future prep sessions.
**Why:** Closes the learning loop on the interview side. The interview prep infrastructure (Socratic chat, voice) makes this nearly free to add.
**Pros:** Learns from real interview experiences, not just rejections. Patterns emerge over time (e.g., "technical competency questions trip me up").
**Cons:** Requires interviewing status transitions to trigger correctly. Only valuable once you've had 3+ interviews.
**Context:** Interview prep mode (Phase 2) must be built first. Debrief is a natural extension — same prompt infrastructure, triggered on status change to rejected/offer.
**Effort:** S (human: ~1 day / CC: ~15 min)
**Priority:** P2
**Depends on:** Interview prep mode (Phase 2)

## P3 — Low Priority / Someday

### Application follow-up tracker
**What:** After 7 days in `applied` status with no update, bot DMs a pre-written follow-up message template.
**Why:** Hiring managers respond to follow-ups. Active pipeline > passive waiting.
**Pros:** Turns passive applications into active ones with zero effort.
**Cons:** Needs meaningful application volume first to be useful.
**Context:** Simple cron check on VPS + DM via Discord bot. No Supabase changes needed.
**Effort:** S (human: ~1 day / CC: ~15 min)
**Priority:** P3
**Depends on:** Nothing
