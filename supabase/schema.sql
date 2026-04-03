-- Job Agent Schema
-- Apply this in Supabase Dashboard → SQL Editor → New Query

create type if not exists job_status as enum ('new', 'applied', 'interviewing', 'offered', 'rejected', 'dismissed');

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  url text,
  description text,
  source text,
  status job_status not null default 'new',
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
  'UC Santa Cruz, 2nd year Business Management Economics major (B.A.), expected graduation June 2028. Located in Berkeley, CA.

Experience:
- Head of Equity Research, Investment Banking Academy (Dec 2025–present)
  Leads Equity Research vertical with weekly market briefings on macro trends and sector performance. Co-authors equity research reports including DCF valuation, trading comparables, and Buy/Sell/Hold recommendations. Evaluates peer stock pitches and provides structured feedback.

- Analyst, Investment Banking Academy (Jan–Dec 2025)
  Conducted financial and strategic analysis of publicly traded companies. Completed Wall Street Prep financial modeling training. Presented valuation findings to peers and mentors.

- Analyst, Santa Cruz Investment Fund (Oct 2025–present)
  Bottom-up equity research on 5+ public companies. Built DCF and trading comps models. Presented investment recommendations in fund deliberations.

- Student Consultant, Haas School of Business (Jul 2024–present)
  Analyzed telecom usage data saving the school ~$5K annually. Implemented QC processes and drafted onboarding materials.

Leadership:
- Vice President of Finance, Alpha Kappa Psi – Chi Gamma Chapter (Jan 2026–present)
  Oversees Finance Committee, budgeting, and fundraising strategy. Organized 8+ events generating $10,000+ in revenue. Manages chapter financial ledger.
- Member, Alpha Kappa Psi (May 2025–present)

Key narrative: "I have been doing finance hands-on since my first semester — leading equity research, building DCF models at a real student fund, and managing a chapter budget. I want to bring that foundation into a professional finance role and keep building."',

  'DCF valuation, trading comparables, sensitivity analysis, bottom-up equity research, Buy/Sell/Hold reports, financial modeling (Wall Street Prep certified), Excel, Python, PowerPoint, Google Sheets, budgeting, financial ledger management. Languages: English (native), Spanish (fluent).',

  'Target roles: Investment Banking Intern, Summer Analyst, Equity Research Intern, Private Equity Intern, Wealth Management Intern, Financial Analyst Intern, M&A Intern, Capital Markets Intern, Asset Management Intern.
Location: SF Bay Area, New York City, or Remote.
Salary: Paid preferred; open to unpaid/for-credit at reputable firms.
Industry: Finance only — IB, PE, WM, asset management, hedge funds, VC. No insurance sales, MLM, or staffing agencies.
Cover letter style: Professional and structured. Opens with genuine interest in the specific firm or role. Names specific experience (DCF models, fund analysis, $10K fundraising). No filler phrases. Under one page.'
) on conflict (id) do nothing;
