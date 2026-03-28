-- Job Agent Schema
-- Apply this in Supabase Dashboard → SQL Editor → New Query

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  url text,
  description text,
  source text,
  status text not null default 'new' check (status in ('new','saved','applied','interviewing','offer','rejected')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  resume_text text,
  skills text,
  preferences text,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  messages jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Disable RLS (single-user app, no auth needed)
alter table jobs disable row level security;
alter table profiles disable row level security;
alter table conversations disable row level security;

-- Seed default profile (upsert so re-running schema is safe)
insert into profiles (id, resume_text, skills, preferences) values (
  '00000000-0000-0000-0000-000000000001',
  'UC Santa Cruz, 4th year CS major (B.A.), graduating June 2026.

Experience:
- Automation Engineer, Cush Real Estate (Jun 2025–present)
  Led RealScout CRM platform transition and onboarded 10+ agents. Automated lead routing (90% time reduction). Built follow-up workflow that increased agent compliance by 35%. Deliver daily analytics briefs to founders translating metrics into business recommendations.

- Sales Engineering Intern, Shockproof (May 2025)
  Built 50-email/day outreach automation from 3,000+ contact list. Navigated complex org structures at banks to reach decision-makers. Cold calling experience.

Leadership:
- Executive Vice President, Alpha Kappa Psi (AKPsi), Chi Gamma Chapter — current. Previously VP of Member Integration.

Key narrative: "I have been on the buying side of a sales engineer interaction. I evaluated RealScout, recommended it to leadership, and led the full rollout for 10+ agents. That experience made me want to do this full-time."',

  'Sales outreach automation, CRM platforms (RealScout, HubSpot), workflow automation, B2B prospecting, cold calling, technical demos, Python, JavaScript/TypeScript, Next.js, Supabase, Claude API, data analysis, translating technical concepts for non-technical buyers',

  'Target roles: SDR, BDR, Sales Engineering, Solutions Engineering, Account Executive (entry), GTM roles at AI/automation/SaaS companies.
Location: SF Bay Area — East Bay and Santa Cruz base. Happy to be in-person in SF.
Target comp: $70–90k base with clear path to $100k+.
Industry preference: AI, automation, real estate tech, SaaS.
Cover letter style: Story-driven, leads with genuine company interest. Strong closer with a logistics/availability line. Best when it tells a specific story rather than listing accomplishments formulaically.'
) on conflict (id) do nothing;
