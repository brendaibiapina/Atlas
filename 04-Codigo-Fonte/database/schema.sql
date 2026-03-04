-- schema.sql
-- Atlas da Reforma Tributaria - schema espelho do setup principal.
-- Arquivo canonico de provisionamento: ../supabase_setup.sql

create table if not exists legal_references (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  source_type text not null,
  publication_date date not null,
  summary text not null,
  status text not null,
  tags text[] default '{}',
  full_text_url text
);

create table if not exists obligations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  reference_title text,
  source_title text,
  source_url text,
  audience text[] default '{}',
  compliance_status text not null,
  start_date date,
  penalty_grace_period_end date
);

alter table obligations add column if not exists source_title text;
alter table obligations add column if not exists source_url text;
alter table obligations add column if not exists start_date date;

create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('OBRIGACAO', 'ATUALIZACAO')),
  item_id text not null,
  title text not null,
  summary text,
  status text,
  source_label text,
  source_url text,
  tags text[] default '{}',
  metadata jsonb default '{}'::jsonb,
  unique (user_id, item_type, item_id)
);

create table if not exists chatbot_knowledge_base (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  slug text not null unique,
  question text not null,
  answer text not null,
  tags text[] default '{}',
  keywords text[] default '{}',
  source_label text default 'Atlas',
  source_url text,
  topic text default 'GERAL',
  priority integer default 0,
  is_active boolean default true
);

create table if not exists user_alert_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email_enabled boolean not null default true,
  alert_frequency text not null default 'IMMEDIATE' check (alert_frequency in ('IMMEDIATE', 'DAILY', 'WEEKLY'))
);
