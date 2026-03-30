---
status: ACTIVE
generated: 2026-03-29
review: /plan-ceo-review (SELECTIVE EXPANSION)
---

# Phase 2: Interview Intelligence + Analytics

## Context

Job agent currently handles: automated discovery → filtering → Discord notifications → status tracking → tailored resume/cover letter → rejection learning.

Phase 2 closes the two remaining feedback loops:
1. **What's working** (application success analytics)
2. **Converting interviews to offers** (Socratic interview coach with voice)

Hard deadline: Josh graduates UCSC June 2026. Build fast, build what moves the needle.

## Accepted Scope

### 1. Application Success Analytics

**Goal:** Know which job sources, titles, and companies actually lead to interviews.

**Implementation:**
- `source` field already in jobs table (populated by scraper via JobSpy `site` field — no migration)
- Conversion = job status moves from `applied` → `interviewing`
- Stats bar on web UI gets: "X% interview rate" + "Top source: LinkedIn"
- Query: `SELECT source, COUNT(*) total, SUM(CASE WHEN status IN ('interviewing','offer') THEN 1 ELSE 0 END) converted FROM jobs GROUP BY source`
- Zero-guard: if 0 total jobs, show "No data yet" not NaN%

**Effort:** S (CC: ~15 min)

---

### 2. Interview Prep Mode — Socratic Coach + Voice

**Goal:** When a job moves to `interviewing`, the chat becomes a structured interview coach.

**User flow:**
```
  User opens chat for interviewing job
          │
          ▼
  Auto-generate briefing:
  - Company overview (from job description)
  - Role requirements
  - Likely interview questions for this title

          │
          ▼ [Start Practice]
  Socratic loop:
  1. Claude asks one targeted question
  2. User speaks (or types) raw answer
  3. Claude reformulates as polished STAR response
  4. TTS reads STAR response aloud
  5. Repeat

          │
          ▼ [End session]
  Session saved in conversations table (mode: 'interview_prep')
```

**Voice implementation:**
- **STT (speech-to-text):** Web Speech API `SpeechRecognition` — browser-native, free, Chrome/Edge only
- **TTS (text-to-speech):** Web Speech API `SpeechSynthesis` — browser-native, free
- Always show text input as fallback (voice is enhancement, not requirement)

**UI states:**
```
  LOADING    → briefing generating (spinner)
  BRIEFING   → overview shown, [Start Practice] button
  LISTENING  → mic pulsing, "Speak now..." hint
  PROCESSING → sending to Claude
  RESPONDING → TTS playing, text shown, [Pause] button
  IDLE       → [Next Question] or mic ready
  ERROR      → "Voice unsupported" or "Couldn't hear you, try again"
```

**Backend changes:**
- `lib/claude.ts`: add `buildInterviewPrepPrompt(job, profile)` — extracts shared profile context logic from `buildSystemPrompt()` into `buildProfileContext()` helper
- `app/api/chat/route.ts`: accept `mode: 'general' | 'interview_prep'` in request body
- `app/chat/page.tsx`: detect `job.status === 'interviewing'`, render prep UI + voice controls
- `conversations` table: no schema change — `mode` stored as marker in messages jsonb

**Critical error handling (must implement before shipping):**
- `SpeechRecognition` not available: feature-detect, show "Voice not supported in this browser" badge
- `onnomatch` / `onerror` on speech input: reset mic state, show "Couldn't hear you — try again or type below"
- `SpeechSynthesis` unavailable: skip TTS silently, text-only mode
- `job.description` null: use "Description not available — asking general questions for [title] at [company]" fallback
- Context creep: trim conversation history after 10 exchanges in prep mode

**Effort:** M (CC: ~30 min for text-only, ~15 min additional for voice)

---

### 3. Newsletter Deletion

- `git rm -r newsletter/` from repo
- Remove VPS cron: `crontab -l | grep newsletter` → `crontab -e` to remove
- No DB tables, no Supabase changes needed

---

## Deferred (TODOS.md)

- **Post-interview debrief mode** (P2): After job moves to rejected/offer, prompt debrief — what was hard, what went well. Feeds back into prep.
- **Application follow-up tracker** (P3): DM after 7 days in `applied` with no update.

## NOT in Scope

- Morning digest (real-time keeps speed advantage on early applications)
- Newsletter network flywheel (newsletter being deleted)
- ElevenLabs TTS (Web Speech API sufficient for personal use)
- `interview_sessions` table (conversations table approach is simpler)

## Build Order

1. Delete newsletter/ + cron
2. Application success analytics (stats bar)
3. Interview prep mode — text-only first
4. Add voice (STT + TTS) on top of working text prep
