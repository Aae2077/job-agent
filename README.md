# Job Agent

An AI-powered job tracking system. It scrapes LinkedIn every 30 minutes, filters jobs through Claude, alerts you on Discord, and tracks your whole pipeline — from first alert to offer.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjsho0%2Fjob-agent&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,ANTHROPIC_API_KEY,INGEST_API_KEY&envDescription=See%20README%20for%20where%20to%20get%20each%20value&project-name=job-agent&repository-name=job-agent)

---

## Fastest setup: use Claude Code

If you have [Claude Code](https://claude.ai/code) installed, the easiest way to personalize this repo is to open it and run:

```
/setup
```

Claude will walk you through every question — your background, target roles, location, resume, cover letter voice — and write all the config files for you. No code editing needed.

---

## What it does

```
LinkedIn ──▶ scraper.py ──▶ Claude (relevance filter) ──▶ Discord alert
                                                       └──▶ Supabase
                                                                │
Discord reaction (📨) ──▶ bot.py ──▶ status update             │
                                                                ▼
                                                     Web UI (Vercel)
                                                     Kanban + AI chat
```

- **Discord alerts** — rich embeds with fit score, applicant count, freshness
- **Kanban board** — New → Saved → Applied → Interviewing → Offer → Rejected
- **AI chat** — cover letters, interview prep, and role analysis per job
- **Reaction shortcuts** — ✅ tailors your resume, 📨 logs application, ❌ dismisses and learns why

---

## Two parts

| Part | What it does | Where it runs |
|------|-------------|---------------|
| **Web UI** (`app/`) | Kanban board + AI assistant | Vercel (free) |
| **Discord Bot + Scraper** (`job-scout/`) | Scrapes LinkedIn, alerts on Discord | Linux VPS |

You can run just the web UI without the bot, or both together.

---

## Quick start — Web UI only (15 minutes)

### 1. Fork this repo

Click **Fork** at the top of this page. You need your own copy to deploy.

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → Run
3. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

> **After deploying:** Run this SQL to lock down your database:
> ```sql
> ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
> ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
> ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
> ```

### 3. Get an Anthropic API key

Sign up at [console.anthropic.com](https://console.anthropic.com) → API keys → Create key.

### 4. Deploy to Vercel

Click the **Deploy with Vercel** button at the top of this README, or:

1. Go to [vercel.com](https://vercel.com) → Add New Project → Import your fork
2. Add these environment variables:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `INGEST_API_KEY` | Any secret string you choose (e.g. `my-secret-key-123`) |

3. Click Deploy. Done.

### 5. Personalize your profile

Open your deployed app → click **Profile** → fill in your background, skills, and preferences. The AI reads this for every cover letter and interview prep session.

---

## Quick start — Discord Bot + Scraper

The bot needs a Linux server (VPS). [Hostinger](https://hostinger.com) has cheap options (~$4/mo).

### Prerequisites

- A Discord server where you are admin
- A Discord bot token ([discord.com/developers](https://discord.com/developers/applications))
- An Anthropic API key
- A Linux VPS

### 1. Clone on your VPS

```bash
git clone https://github.com/YOUR-USERNAME/job-agent.git
cd job-agent/job-scout
python3 -m venv venv
source venv/bin/activate
pip install anthropic jobspy discord.py discord-webhook python-dotenv requests beautifulsoup4 pypdf pyyaml
```

### 2. Set up your environment

```bash
cp .env.example .env
nano .env
```

| Variable | Where to get it |
|----------|----------------|
| `DISCORD_BOT_TOKEN` | Discord Developer Portal → your app → Bot → Token |
| `DISCORD_WEBHOOK_URL` | Discord server → channel settings → Integrations → Webhooks |
| `DISCORD_CHANNEL_ID` | Right-click job alerts channel → Copy Channel ID |
| `REQUESTS_CHANNEL_ID` | Right-click #requests channel → Copy Channel ID |
| `DISCORD_USER_ID` | Discord settings → Advanced → Developer Mode → right-click yourself → Copy User ID |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `INGEST_URL` | Your Vercel app URL + `/api/jobs/ingest` (e.g. `https://my-app.vercel.app/api/jobs/ingest`) |
| `INGEST_API_KEY` | The same secret string you set in Vercel |

### 3. Discord bot setup

In the [Discord Developer Portal](https://discord.com/developers/applications):
1. Bot → enable **Message Content Intent** and **Server Members Intent**
2. OAuth2 → URL Generator → scopes: `bot` → permissions: `Send Messages`, `Read Message History`, `Add Reactions`, `Attach Files`
3. Use the generated URL to invite the bot to your server

### 4. Personalize for yourself

**Option A: Claude Code (recommended)**
Open the repo in Claude Code and run `/setup` — it will ask you everything and write the files.

**Option B: Edit manually**

**`scraper_config.json`** — what to search for:
```json
{
  "search_terms": ["SDR tech", "Sales Engineer entry level"],
  "locations": ["San Francisco, CA", "Remote"],
  "watchlist_companies": ["anthropic", "openai", "stripe"]
}
```

**`candidate_profile.yaml`** — who you are (what Claude reads when filtering jobs):
```yaml
name: "Your Name"
background: "Recent CS grad, graduating May 2025 from State University"
main_roles:
  target_roles: "SDR, BDR, Sales Engineer"
  locations: "NYC or Remote"
  min_pay: "$60k+ base"
```

**`experience_kb.yaml`** — your resume (used for cover letter generation):
```bash
cp experience_kb.yaml.example experience_kb.yaml
nano experience_kb.yaml
```

### 5. Run the scraper

```bash
# Test it once
source venv/bin/activate
python scraper.py

# Schedule with cron (every 30 minutes)
crontab -e
# Add:
# */30 * * * * /home/you/job-agent/job-scout/venv/bin/python /home/you/job-agent/job-scout/scraper.py
```

### 6. Run the bot (persistent)

```bash
# Edit job-scout-bot.service — update WorkingDirectory and ExecStart to your actual path
sudo cp job-scout-bot.service /etc/systemd/system/
sudo systemctl enable jobscout-bot
sudo systemctl start jobscout-bot
```

---

## Reactions and commands

### Reactions on job alert messages

| Reaction | What happens |
|----------|-------------|
| ✅ | Generates tailored resume + cover letter via Claude |
| 📨 | Marks the job as Applied and syncs to the web board |
| ❌ | Dismisses and asks why — uses your reasons to improve future filtering |

### #requests channel

Post any job URL or PDF in your `#requests` channel and the bot will ask what you want:
- `tailor my resume and cover letter`
- `just the cover letter, startup tone`
- `tailor everything, I have a referral there`

### Bot commands

| Command | Description |
|---------|-------------|
| `!tracker` | Full pipeline view |
| `!stats` | Stats + top rejection reasons |
| `!applied <url> <Company> - <Role>` | Manually log an application |
| `!status <url> <status>` | Update status |
| `!note <url> <text>` | Add a note |
| `!help` | All commands |

---

## Deploying updates

```bash
# Web UI — push to GitHub, Vercel auto-deploys
git push origin master

# VPS — pull and restart
ssh you@your-server
cd ~/job-agent && git pull
sudo systemctl restart jobscout-bot
```

---

## Tech stack

| Layer | Tech |
|-------|------|
| Web UI | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic Claude (sonnet-4-6 for chat, haiku-4-5 for filtering) |
| Hosting | Vercel |
| Scraping | JobSpy, BeautifulSoup |
| Bot | discord.py |

---

## Local development

```bash
npm install
cp .env.local.example .env.local  # fill in your Supabase + Anthropic keys
npm run dev                        # http://localhost:3000
npm test                           # run tests
```
