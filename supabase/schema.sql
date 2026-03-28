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
