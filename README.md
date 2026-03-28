# Job Agent

An AI-powered job tracking system with two tightly integrated components:

- **Discord Bot + Scraper** (`job-scout/`) — scrapes LinkedIn every 30 minutes, filters jobs through Claude, alerts you on Discord, and lets you manage your pipeline with emoji reactions
- **Web UI** (`app/`) — a kanban board + AI chat assistant deployed on Vercel, backed by Supabase

Both halves share the same database. Jobs found by the scraper appear on your board automatically. Reacting 📨 on Discord moves the card to Applied. Status changes in either place stay in sync.

---

## Architecture

```
LinkedIn ──▶ scraper.py ──▶ Claude (relevance filter) ──▶ Discord alert
                                                       └──▶ Supabase jobs table
                                                                    │
Discord reaction (📨) ──▶ bot.py ──▶ Supabase status update        │
                                                                    ▼
                                                          Web UI (Vercel)
                                                          Kanban board + AI chat
```

---

## Part 1 — Discord Bot + Scraper

### What it does

- Scrapes LinkedIn for SDR, BDR, Sales Engineer, Solutions Engineer, DevRel, Prompt Engineer, and GTM roles
- Filters each job through Claude Haiku — checks experience requirements, location, industry, salary, and freshness
- Only alerts you on roles posted under 2 hours ago OR with fewer than 10 applicants (apply early)
- Sends rich Discord embeds with fit score, applicant count, and freshness flags
- Lets you manage your pipeline with reactions and commands from Discord
- Mirrors every status change to the web UI in real time

### Reactions on job alert messages

| Reaction | What happens |
|----------|-------------|
| ✅ | Generates a tailored resume + cover letter via `tailor.py` and posts it in Discord |
| 📨 | Marks the job as Applied in your tracker and moves it to Applied on the web board |
| ❌ | Dismisses the job and asks why — uses your reasons to improve future filtering |

### Bot commands

| Command | Description |
|---------|-------------|
| `!applied <url> <Company> - <Role>` | Manually log an application |
| `!status <url> <status>` | Update status: `phone_screen`, `interview`, `offer`, `rejected`, `withdrawn` |
| `!tracker` | Show your full application pipeline |
| `!stats` | Application stats + top rejection reasons |
| `!note <url> <note>` | Add a note to an application |
| `!help` | Show all commands |

### #requests channel

Post a job URL or PDF in your `#requests` channel and the bot will ask what you want:

- `tailor my resume and cover letter`
- `just the cover letter, startup tone`
- `tailor everything, note I have a referral there`

Reply `skip` to use defaults.

---

### Setup

#### Prerequisites

- Python 3.10+
- A Discord server where you are admin
- A Discord bot token ([discord.com/developers](https://discord.com/developers/applications))
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- A Linux server or VPS (the scraper runs as a cron job)

#### 1. Clone and install

```bash
git clone https://github.com/jsho0/job-agent.git
cd job-agent/job-scout
python3 -m venv venv
source venv/bin/activate
pip install anthropic jobspy discord.py discord-webhook python-dotenv requests beautifulsoup4 pypdf
```

#### 2. Configure environment

```bash
cp .env.example .env
nano .env
```

| Variable | Where to get it |
|----------|----------------|
| `DISCORD_BOT_TOKEN` | Discord Developer Portal → your app → Bot → Token |
| `DISCORD_WEBHOOK_URL` | Discord server → channel settings → Integrations → Webhooks |
| `DISCORD_CHANNEL_ID` | Right-click the job alerts channel → Copy Channel ID |
| `REQUESTS_CHANNEL_ID` | Right-click the #requests channel → Copy Channel ID |
| `DISCORD_USER_ID` | Discord settings → Advanced → Developer Mode on → right-click yourself → Copy User ID |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `INGEST_URL` | Your web UI URL e.g. `https://your-app.vercel.app` (optional) |
| `INGEST_API_KEY` | Any secret string you choose — must match Vercel env var (optional) |

#### 3. Discord bot permissions

In the Discord Developer Portal:
1. Bot → enable **Message Content Intent** and **Server Members Intent**
2. OAuth2 → URL Generator → scopes: `bot` → permissions: `Send Messages`, `Read Message History`, `Add Reactions`, `Attach Files`
3. Use the generated URL to invite the bot to your server

#### 4. Customize the scraper for yourself

Open `scraper.py` and update these sections to match your target profile:

```python
# What roles to search for
SEARCH_TERMS = [
    "Sales Development Representative",
    "BDR SaaS",
    # add your own
]

# What locations to search
LOCATIONS = [
    "San Francisco, CA",
    "New York, NY",
]

# Companies you really want (get gold color in Discord)
WATCHLIST_COMPANIES = [
    "stripe", "anthropic", "openai",
]
```

The `claude_relevance_check()` function contains a profile prompt — update it to describe your own experience level, target roles, and what disqualifies a role for you.

#### 5. Run the scraper

```bash
# Test run
source venv/bin/activate
python scraper.py

# Schedule with cron (every 30 minutes)
crontab -e
# Add this line:
# */30 * * * * /path/to/job-scout/venv/bin/python /path/to/job-scout/scraper.py
```

#### 6. Run the bot (persistent)

```bash
# Test
source venv/bin/activate
python bot.py

# As a systemd service (Linux)
# Edit job-scout-bot.service — update WorkingDirectory and ExecStart to your actual path
sudo cp job-scout-bot.service /etc/systemd/system/
sudo systemctl enable jobscout-bot
sudo systemctl start jobscout-bot
```

---

## Part 2 — Web UI

A Next.js kanban board with an AI chat assistant. Jobs flow in automatically from the scraper; you can also add them manually with one-click URL scraping to auto-fill the description.

### Features

- Kanban board: New → Saved → Applied → Interviewing → Offer → Rejected
- Company logos via Clearbit (falls back to colored initials)
- Stats bar: total tracked, applied, interviewing, offers
- Add Job form with **Fetch** button — paste a URL and it auto-fills the description
- Per-job AI chat: cover letters, interview prep, role analysis grounded in your profile
- General career chat: resume feedback, cold outreach drafts, interview prep
- Profile page: edit your background, skills, preferences — the AI reads this on every chat

### Setup

#### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it
3. Note your **Project URL**, **anon public key**, and **service_role key** from Settings → API

#### 2. Deploy to Vercel

Connect your fork to Vercel for auto-deploy on push, or use the CLI:

```bash
npm i -g vercel
vercel
```

#### 3. Environment variables

Set these in Vercel dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `INGEST_API_KEY` | Same secret string you set in the bot `.env` |

#### 4. Local development

```bash
npm install
cp .env.local.example .env.local  # fill in the same vars
npm run dev
```

---

## Deploying updates

```bash
# Push changes — Vercel auto-deploys the web UI
git add -A && git commit -m "your message" && git push origin master

# On the VPS — pull latest and restart the bot
cd ~/job-agent && git pull
sudo systemctl restart jobscout-bot
```

---

## Tech stack

| Layer | Tech |
|-------|------|
| Web UI | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic Claude (sonnet-4-6 for chat, haiku-4-5 for job filtering) |
| Hosting | Vercel |
| Scraping | JobSpy, BeautifulSoup |
| Bot | discord.py |
