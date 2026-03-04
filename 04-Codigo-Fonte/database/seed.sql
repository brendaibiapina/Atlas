-- seed.sql
-- Atlas da Reforma Tributaria - seed espelho do seed principal.
-- Arquivo canonico de dados: ../seed_real_data.sql

insert into legal_references (title, source_type, publication_date, summary, status, tags, full_text_url)
values
(
  'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025',
  'DOU',
  '2025-12-22',
  'Define obrigacoes acessorias para o periodo de transicao da reforma tributaria do consumo.',
  'VIGENTE',
  '{OBRIGACOES, CBS, IBS}',
  'https://in.gov.br/en/web/dou/-/ato-conjunto-rfb/cgibs-n-1-de-22-de-dezembro-de-2025-677624586'
)
on conflict do nothing;

insert into obligations (
  title,
  description,
  reference_title,
  source_title,
  source_url,
  audience,
  compliance_status,
  start_date,
  penalty_grace_period_end
)
values
(
  'Emitir NF-e com destaque de CBS e IBS',
  'Obrigacao de destacar CBS e IBS no documento fiscal no periodo de teste.',
  'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025',
  'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025',
  'https://in.gov.br/en/web/dou/-/ato-conjunto-rfb/cgibs-n-1-de-22-de-dezembro-de-2025-677624586',
  '{CONTADOR}',
  'EDUCATIVO',
  '2026-01-01',
  '2026-12-31'
)
on conflict do nothing;
