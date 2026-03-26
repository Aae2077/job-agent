-- Run this in your Supabase SQL editor

create table if not exists profiles (
  id text primary key,
  resume_text text,
  skills text,
  preferences text,
  updated_at timestamptz default now()
);

create type job_status as enum ('new', 'saved', 'applied', 'interviewing', 'offer', 'rejected');

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  url text,
  description text,
  source text,
  status job_status not null default 'new',
  notes text,
  created_at timestamptz default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  messages jsonb not null default '[]',
  created_at timestamptz default now()
);

-- Disable RLS for single-user setup (no auth)
alter table profiles disable row level security;
alter table jobs disable row level security;
alter table conversations disable row level security;
