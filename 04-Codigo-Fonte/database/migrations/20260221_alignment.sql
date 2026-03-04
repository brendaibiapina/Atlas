-- 20260221_alignment.sql
-- Alinhamento de schema para o Atlas

alter table if exists obligations
  add column if not exists source_title text,
  add column if not exists source_url text,
  add column if not exists start_date date;

alter table if exists legal_references
  add column if not exists source_type text,
  add column if not exists summary text,
  add column if not exists full_text_url text;

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

update obligations
set reference_title = 'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025'
where reference_title ilike '%Lei Complementar%214/2025%';

update obligations
set source_title = coalesce(source_title, 'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025'),
    source_url = coalesce(source_url, 'https://in.gov.br/en/web/dou/-/ato-conjunto-rfb/cgibs-n-1-de-22-de-dezembro-de-2025-677624586')
where true;

update obligations
set start_date = '2026-01-01'
where start_date is null
  and compliance_status not in ('FUTURO', 'EM_CONSTRUCAO');
