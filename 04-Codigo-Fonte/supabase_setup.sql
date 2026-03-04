-- PASSO 1: TABELA DE NORMAS (JÁ CRIADA, MAS O IF NOT EXISTS PROTEGE)
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

-- PASSO 2: TABELA DE OBRIGAÇÕES (CHECKLIST)
create table if not exists obligations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  reference_title text, -- Qual lei criou essa obrigação?
  source_title text, -- Nome da fonte normativa de origem
  source_url text, -- Link oficial da fonte normativa
  audience text[] default '{}', -- CONTADOR, ADVOGADO, IMOBILIARIO
  compliance_status text not null, -- VIGENTE, EDUCATIVO, FUTURO, EM_CONSTRUCAO
  start_date date, -- Prazo de início quando existir
  penalty_grace_period_end date -- Data fim da anistia (educativo)
);

-- Passo complementar para ambientes já existentes
alter table obligations add column if not exists source_title text;
alter table obligations add column if not exists source_url text;
alter table obligations add column if not exists start_date date;

-- PASSO 2.1: TABELA DE FAVORITOS POR USUÁRIO
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

-- PASSO 2.2: TABELA DE BASE DE CONHECIMENTO DO CHATBOT
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

-- PASSO 2.3: PREFERÊNCIAS DE ALERTA POR USUÁRIO
create table if not exists user_alert_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email_enabled boolean not null default true,
  alert_frequency text not null default 'IMMEDIATE' check (alert_frequency in ('IMMEDIATE', 'DAILY', 'WEEKLY'))
);

-- PASSO 3: SEGURANÇA (RLS)
alter table legal_references enable row level security;
alter table obligations enable row level security;
alter table favorites enable row level security;
alter table chatbot_knowledge_base enable row level security;
alter table user_alert_preferences enable row level security;

-- Remove políticas antigas para permitir rerun idempotente
drop policy if exists "Leitura Publica Normas" on legal_references;
drop policy if exists "Insercao Publica Normas" on legal_references;
drop policy if exists "Leitura Publica Obrigacoes" on obligations;
drop policy if exists "Insercao Publica Obrigacoes" on obligations;
drop policy if exists "Leitura Favoritos Usuario" on favorites;
drop policy if exists "Insercao Favoritos Usuario" on favorites;
drop policy if exists "Atualizacao Favoritos Usuario" on favorites;
drop policy if exists "Exclusao Favoritos Usuario" on favorites;
drop policy if exists "Leitura Publica Chatbot" on chatbot_knowledge_base;
drop policy if exists "Insercao Publica Chatbot" on chatbot_knowledge_base;
drop policy if exists "Leitura PreferenciasAlertaUsuario" on user_alert_preferences;
drop policy if exists "InsercaoPreferenciasAlertaUsuario" on user_alert_preferences;
drop policy if exists "AtualizacaoPreferenciasAlertaUsuario" on user_alert_preferences;
drop policy if exists "Insercao Admin Normas" on legal_references;
drop policy if exists "Atualizacao Admin Normas" on legal_references;
drop policy if exists "Exclusao Admin Normas" on legal_references;
drop policy if exists "Insercao Admin Obrigacoes" on obligations;
drop policy if exists "Atualizacao Admin Obrigacoes" on obligations;
drop policy if exists "Exclusao Admin Obrigacoes" on obligations;
drop policy if exists "Insercao Admin Chatbot" on chatbot_knowledge_base;
drop policy if exists "Atualizacao Admin Chatbot" on chatbot_knowledge_base;
drop policy if exists "Exclusao Admin Chatbot" on chatbot_knowledge_base;

-- POLÍTICAS DE LEITURA (público)
create policy "Leitura Publica Normas"
on legal_references
for select
to anon, authenticated
using (true);

create policy "Leitura Publica Obrigacoes"
on obligations
for select
to anon, authenticated
using (true);

create policy "Leitura Favoritos Usuario"
on favorites
for select
to authenticated
using (auth.uid() = user_id);

create policy "Insercao Favoritos Usuario"
on favorites
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Atualizacao Favoritos Usuario"
on favorites
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Exclusao Favoritos Usuario"
on favorites
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Leitura Publica Chatbot"
on chatbot_knowledge_base
for select
to anon, authenticated
using (true);

create policy "Leitura PreferenciasAlertaUsuario"
on user_alert_preferences
for select
to authenticated
using (auth.uid() = user_id);

create policy "InsercaoPreferenciasAlertaUsuario"
on user_alert_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "AtualizacaoPreferenciasAlertaUsuario"
on user_alert_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- POLÍTICAS DE ESCRITA (somente admin autenticado)
-- Ajuste o e-mail abaixo caso necessário.
create policy "Insercao Admin Normas"
on legal_references
for insert
to authenticated
with check (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com');

create policy "Atualizacao Admin Normas"
on legal_references
for update
to authenticated
using (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com')
with check (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com');

create policy "Exclusao Admin Normas"
on legal_references
for delete
to authenticated
using (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com');

create policy "Insercao Admin Obrigacoes"
on obligations
for insert
to authenticated
with check (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com');

create policy "Atualizacao Admin Obrigacoes"
on obligations
for update
to authenticated
using (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com')
with check (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com');

create policy "Exclusao Admin Obrigacoes"
on obligations
for delete
to authenticated
using (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com');

create policy "Insercao Admin Chatbot"
on chatbot_knowledge_base
for insert
to authenticated
with check (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com');

create policy "Atualizacao Admin Chatbot"
on chatbot_knowledge_base
for update
to authenticated
using (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com')
with check (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com');

create policy "Exclusao Admin Chatbot"
on chatbot_knowledge_base
for delete
to authenticated
using (lower(auth.jwt()->>'email') = 'brendaibiapina@testeatlas.com');
