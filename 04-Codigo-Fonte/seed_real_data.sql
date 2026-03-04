-- =====================================================================================
-- ARQUIVO: seed_real_data.sql
-- DADOS OFICIAIS EXTRAÍDOS DE: https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-consumo
-- ATUALIZADO EM: 19/02/2026
-- =====================================================================================

-- Limpar dados antigos para evitar duplicatas (rodar apenas se quiser resetar)
-- DELETE FROM legal_references;
-- DELETE FROM obligations;

-- =====================================================================================
-- 1. MARCOS REGULATÓRIOS (Fonte: /marcos)
-- =====================================================================================

INSERT INTO legal_references (title, source_type, publication_date, summary, status, tags, full_text_url)
VALUES 
(
    'Emenda Constitucional nº 132/2023', 
    'CAMARA', 
    '2023-12-20', 
    'Altera o Sistema Tributário Nacional. Ficou conhecida como Reforma Tributária do Consumo. Cria IBS, CBS e IS em substituição a PIS, Cofins, ICMS, ISS e IPI. Define período de transição de 2026 a 2033.', 
    'VIGENTE', 
    '{IBS, CBS, IS, GERAL, CONSTITUICAO}', 
    'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm'
),
(
    'Portaria RFB nº 501/2024', 
    'RFB', 
    '2024-12-20', 
    'Institui o Programa de Reforma Tributária do Consumo (Programa RTC) para implantação da reforma tributária de que trata a EC nº 132/2023. Organiza a estrutura interna da RFB para conduzir a transição.', 
    'VIGENTE', 
    '{RTC, PROGRAMA, ORGANIZACAO}', 
    'https://normasinternet2.receita.fazenda.gov.br/#/consulta/externa/142233'
),
(
    'Lei Complementar nº 214/2025', 
    'DOU', 
    '2025-01-16', 
    'Institui o Imposto sobre Bens e Serviços (IBS), a Contribuição Social sobre Bens e Serviços (CBS) e o Imposto Seletivo (IS). Cria o Comitê Gestor do IBS e altera a legislação tributária. Define alíquotas de referência, regimes diferenciados e cashback.', 
    'VIGENTE', 
    '{IBS, CBS, IS, GERAL}', 
    'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm'
),
(
    'Portaria RFB nº 549/2025', 
    'RFB', 
    '2025-06-13', 
    'Institui o Piloto da Reforma Tributária do Consumo referente à Contribuição sobre Bens e Serviços (Piloto RTC - CBS). Permite que contribuintes testem voluntariamente os sistemas antes da obrigatoriedade.', 
    'VIGENTE', 
    '{CBS, PILOTO, TESTES}', 
    'https://normasinternet2.receita.fazenda.gov.br/#/consulta/externa/144661'
),
(
    'Lei Complementar nº 227/2026', 
    'DOU', 
    '2026-01-13', 
    'Institui o Comitê Gestor do IBS (CGIBS). Dispõe sobre o processo administrativo tributário do IBS e novas regras de contagem de prazos processuais. Altera procedimentos para contribuintes e servidores.', 
    'VIGENTE', 
    '{IBS, CGIBS, PROCESSO, PRAZOS}', 
    'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp227.htm'
);

-- =====================================================================================
-- 2. NOTÍCIAS OFICIAIS (Fonte: /noticias - Fev/2026)
-- =====================================================================================

INSERT INTO legal_references (title, source_type, publication_date, summary, status, tags, full_text_url)
VALUES
(
    'RFB disponibiliza manuais e leiautes da DeRE', 
    'RFB', 
    '2026-02-15', 
    'Receita Federal disponibiliza manuais e leiautes da nova Declaração de Regimes Específicos (DeRE). Guias já podem ser acessados para apoiar o preenchimento da nova obrigação acessória.', 
    'VIGENTE', 
    '{DeRE, OBRIGACOES, MANUAIS}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/fevereiro/reforma-tributaria-receita-federal-disponibiliza-manuais-e-leiautes-da-nova-declaracao-de-regimes-especificos-dere'
),
(
    'RFB lança chatbot com IA sobre a Reforma', 
    'RFB', 
    '2026-02-10', 
    'Receita Federal lança chatbot com IA Generativa sobre a Reforma Tributária para o público externo. Auxilia contribuintes a resolver dúvidas gerais sobre a RTC.', 
    'VIGENTE', 
    '{TECNOLOGIA, IA, CONTRIBUINTE}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/fevereiro/receita-federal-lanca-chatbot-com-ia-generativa-sobre-a-reforma-tributaria-para-o-publico-externo'
),
(
    'Perguntas e Respostas sobre LC 227/2026 (prazos processuais)', 
    'RFB', 
    '2026-02-08', 
    'Receita Federal publica documento orientando servidores e contribuintes sobre as novas regras relativas à contagem de prazos processuais introduzidas pela LC nº 227/2026.', 
    'VIGENTE', 
    '{PRAZOS, PROCESSO, LC227}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/fevereiro/receita-federal-publica-perguntas-e-respostas-sobre-as-mudancas-realizadas-pela-lei-complementar-no-227-2026-nos-prazos-processuais-1'
),
(
    'ALERTA: É falso que todo proprietário pagará imposto sobre aluguel em 2026', 
    'RFB', 
    '2026-01-20', 
    'Receita Federal esclarece que a equiparação de aluguel por temporada (≤ 90 dias) a hotelaria só vale para quem já é contribuinte de IBS/CBS. Pessoa física só vira contribuinte se tiver mais de 3 imóveis E receita anual de aluguel acima de R$ 240 mil.', 
    'VIGENTE', 
    '{IMOBILIARIO, ALUGUEL, FAKE_NEWS}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/janeiro/receita-federal-alerta-e-falso-que-201ctodo-proprietario-que-aluga-por-temporada-pagara-novo-imposto-imediato-sobre-o-aluguel-em-2026'
),
(
    'Lançamento oficial da Reforma Tributária do Consumo', 
    'RFB', 
    '2026-01-15', 
    'Fazenda, Receita e Serpro lançam a Reforma Tributária do Consumo em cerimônia em Brasília. Evento marca o início da maior infraestrutura digital tributária da história do país.', 
    'VIGENTE', 
    '{LANCAMENTO, PORTAL, GERAL}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/janeiro/fazenda-receita-e-serpro-lancam-reforma-tributaria-do-consumo-em-cerimonia-em-brasilia'
),
(
    'Portal Nacional de Tributação sobre Consumo', 
    'RFB', 
    '2026-01-15', 
    'Portal nacional de tributação sobre o consumo de bens e serviços já está no ar. Permite acesso a serviços digitais relacionados à apuração dos tributos IBS e CBS.', 
    'VIGENTE', 
    '{PORTAL, CBS, IBS, TECNOLOGIA}', 
    'https://consumo.tributos.gov.br'
);

-- =====================================================================================
-- 3. NOTÍCIAS OFICIAIS (Fonte: /noticias - Dez/2025)
-- =====================================================================================

INSERT INTO legal_references (title, source_type, publication_date, summary, status, tags, full_text_url)
VALUES
(
    'Norma sobre benefícios onerosos de ICMS', 
    'RFB', 
    '2025-12-18', 
    'Receita Federal publica norma sobre a habilitação dos titulares de benefícios de ICMS que exigem contrapartida por parte dos contribuintes. Relevante para a transição do ICMS para o IBS.', 
    'VIGENTE', 
    '{ICMS, TRANSICAO, BENEFICIOS}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/receita-federal-edita-norma-que-dispoe-sobre-habilitacao-dos-titulares-de-beneficios-onerosos-de-icms'
),
(
    'API para consulta à apuração de CBS liberada', 
    'RFB', 
    '2025-12-15', 
    'Receita Federal libera API para consulta à apuração de CBS. Permite que desenvolvedores e ERPs integrem a consulta diretamente em seus sistemas.', 
    'VIGENTE', 
    '{CBS, API, TECNOLOGIA, T.I.}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/receita-libera-api-para-consulta-a-apuracao-de-cbs'
),
(
    'Obrigações acessórias da Reforma para início de 2026', 
    'RFB', 
    '2025-12-10', 
    'Receita Federal e Comitê Gestor do IBS definem regras relativas a obrigações acessórias da Reforma Tributária para início de 2026. Detalha quais declarações serão exigidas e seus prazos.', 
    'VIGENTE', 
    '{OBRIGACOES, ACESSORIAS, IBS, CBS}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/receita-federal-e-comite-gestor-do-ibs-definem-regras-relativas-a-obrigacoes-acessorias-da-reforma-tributaria-para-inicio-de-2026'
),
(
    'Esclarecimento: CBS na locação de imóvel', 
    'RFB', 
    '2025-12-05', 
    'Receita Federal esclarece sobre a opção da CBS na locação, cessão onerosa ou arrendamento de bem imóvel. Define critérios para contribuinte pessoa física e pessoa jurídica.', 
    'VIGENTE', 
    '{CBS, IMOBILIARIO, LOCACAO}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/receita-federal-esclarece-sobre-opcao-da-cbs-na-locacao-cessao-onerosa-ou-arrendamento-de-bem-imovel'
),
(
    'DTE automática obrigatória a partir de 2026', 
    'RFB', 
    '2025-11-20', 
    'Reforma Tributária do Consumo (RTC) - Obrigatoriedade ao Domicílio Tributário Eletrônico (DTE) torna-se automática a partir de 2026 para todos os contribuintes.', 
    'VIGENTE', 
    '{DTE, OBRIGACOES, GERAL}', 
    'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/novembro/reforma-tributaria-do-consumo-rtc-obrigatoriedade-ao-dte-automatica-a-partir-de-2026'
);

-- =====================================================================================
-- 4. OBRIGAÇÕES 2026 (Fonte: /orientacoes-2026)
-- =====================================================================================

INSERT INTO obligations (title, description, reference_title, audience, compliance_status, penalty_grace_period_end)
VALUES
(
    'Emitir NF-e com destaque de CBS e IBS', 
    'A partir de 01/01/2026, a Nota Fiscal Eletrônica (NF-e) deve ser emitida com destaque da CBS e do IBS, individualizados por operação, conforme leiautes definidos em Notas Técnicas específicas. O contribuinte está dispensado do recolhimento em 2026 (ano de teste).', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR}', 
    'EDUCATIVO', 
    '2026-12-31'
),
(
    'Emitir NFC-e com destaque de CBS e IBS', 
    'A Nota Fiscal de Consumidor Eletrônica (NFC-e) deve incluir os novos campos de CBS e IBS a partir de 01/01/2026. Aplica-se ao varejo e comércio em geral.', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR}', 
    'EDUCATIVO', 
    '2026-12-31'
),
(
    'Emitir CT-e com destaque de CBS e IBS', 
    'O Conhecimento de Transporte Eletrônico (CT-e) e o CT-e OS (Outros Serviços) devem ser emitidos com destaque da CBS e do IBS. Obrigatório para transportadoras e prestadores de serviço de transporte.', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR}', 
    'EDUCATIVO', 
    '2026-12-31'
),
(
    'Emitir NFS-e com destaque de CBS e IBS', 
    'A Nota Fiscal de Serviço Eletrônica (NFS-e) deve incluir os campos de CBS e IBS. Aplica-se a todos os prestadores de serviços. Inclui também a nova NFS-e Via (Exploração de Via).', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR, ADVOGADO}', 
    'EDUCATIVO', 
    '2026-12-31'
),
(
    'Emitir NFCom com destaque de CBS e IBS', 
    'A Nota Fiscal Fatura de Serviços de Comunicação Eletrônica (NFCom) deve incluir CBS e IBS. Obrigatório para empresas de telecomunicação.', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR}', 
    'EDUCATIVO', 
    '2026-12-31'
),
(
    'Emitir NF3e com destaque de CBS e IBS', 
    'A Nota Fiscal de Energia Elétrica Eletrônica (NF3e) deve incluir CBS e IBS. Obrigatório para distribuidoras de energia elétrica.', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR}', 
    'EDUCATIVO', 
    '2026-12-31'
),
(
    'Emitir BP-e com destaque de CBS e IBS', 
    'O Bilhete de Passagem Eletrônico (BP-e) e o BP-e TM (Transporte Metropolitano) devem incluir CBS e IBS. Obrigatório para empresas de transporte de passageiros.', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR}', 
    'EDUCATIVO', 
    '2026-12-31'
),
(
    'Apresentar DeRE (Declaração de Regimes Específicos)', 
    'Quando disponibilizada, a DeRE deverá ser apresentada por contribuintes enquadrados em regimes específicos: Instituições Financeiras, Planos de Saúde, Concurso de Prognóstico, Administração de Consórcio, Seguro e Previdência. Leiautes em construção para alguns regimes.', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR, ADVOGADO}', 
    'EM_CONSTRUCAO', 
    NULL
),
(
    'Inscrição de PF contribuinte no CNPJ (a partir de Jul/2026)', 
    'A partir de julho de 2026, pessoas físicas que sejam contribuintes da CBS e do IBS deverão se inscrever no CNPJ. A inscrição NÃO transforma PF em PJ — serve apenas para facilitar a apuração tributária.', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR, ADVOGADO, IMOBILIARIO}', 
    'FUTURO', 
    NULL
),
(
    'Adaptar sistemas para NF-ABI (Alienação de Bens Imóveis)', 
    'A Nota Fiscal de Alienação de Bens Imóveis (NF-ABI) é uma nova obrigação com leiaute já definido. Data de vigência será determinada em documento técnico específico. Afeta diretamente o setor imobiliário.', 
    'Lei Complementar nº 214/2025', 
    '{IMOBILIARIO, CONTADOR, ADVOGADO}', 
    'EM_CONSTRUCAO', 
    NULL
),
(
    'Adesão ao DTE (Domicílio Tributário Eletrônico)', 
    'A partir de 2026, a inscrição no Domicílio Tributário Eletrônico (DTE) torna-se automática e obrigatória para todos os contribuintes. Todas as comunicações da RFB serão por meio eletrônico.', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR, ADVOGADO, IMOBILIARIO}', 
    'VIGENTE', 
    NULL
),
(
    'Monitoramento: Dispensa de Recolhimento em 2026', 
    'IMPORTANTE: O ano de 2026 é o ano de teste da CBS e do IBS. Contribuintes que emitirem documentos fiscais ou DeRE observando as normas vigentes estão DISPENSADOS do recolhimento efetivo. Também dispensados os contribuintes sem obrigação acessória definida.', 
    'Lei Complementar nº 214/2025', 
    '{CONTADOR, ADVOGADO, IMOBILIARIO}', 
    'EDUCATIVO', 
    '2026-12-31'
);

-- Normalização de referência e origem das obrigações
UPDATE obligations
SET reference_title = 'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025'
WHERE reference_title ILIKE '%Lei Complementar%214/2025%';

UPDATE obligations
SET source_title = 'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025',
    source_url = 'https://in.gov.br/en/web/dou/-/ato-conjunto-rfb/cgibs-n-1-de-22-de-dezembro-de-2025-677624586'
WHERE source_title IS NULL OR source_url IS NULL;

UPDATE obligations
SET start_date = '2026-01-01'
WHERE start_date IS NULL
  AND compliance_status NOT IN ('FUTURO', 'EM_CONSTRUCAO');

-- =====================================================================================
-- 5. BASE OPERACIONAL DO CHATBOT
-- =====================================================================================

INSERT INTO chatbot_knowledge_base (slug, question, answer, tags, keywords, source_label, topic, priority, is_active)
VALUES
(
    'operacional-modulos',
    'Quais módulos existem no sistema Atlas e para que servem?',
    'O painel possui os módulos Visão Geral, Obrigações, Timeline, Radar, Imobiliário e Dúvidas Frequentes. Visão Geral concentra o resumo executivo. Obrigações lista regras e prazos. Timeline mostra os marcos da transição. Radar reúne normas e notícias oficiais. Imobiliário traz impactos do setor e simulador. Dúvidas Frequentes reúne perguntas oficiais e o chat com base interna.',
    '{modulos, dashboard, operacionalidade, como usar}',
    '{modulos, menu, navegacao, painel}',
    'Atlas',
    'OPERACIONAL',
    10,
    true
),
(
    'operacional-faq',
    'Como usar a página de Dúvidas Frequentes?',
    'Na página de Dúvidas Frequentes você pode buscar por palavra chave, filtrar por categoria e abrir as respostas em acordeão. No lado esquerdo há o chat para perguntas livres com base em dados internos do sistema.',
    '{faq, duvidas frequentes, filtro, busca}',
    '{buscar, filtrar, categoria, perguntas}',
    'Atlas',
    'OPERACIONAL',
    10,
    true
),
(
    'operacional-chat-limite',
    'O chat pode inventar resposta?',
    'Não. O chat responde somente com base em informações existentes no sistema. Quando não encontra base suficiente, informa explicitamente que não encontrou informação com segurança.',
    '{chat, seguranca, base interna}',
    '{alucinacao, inventar, sem lastro, limite}',
    'Atlas',
    'OPERACIONAL',
    10,
    true
),
(
    'operacional-obrigacoes',
    'Como consultar prazos no módulo de Obrigações?',
    'No módulo de Obrigações você encontra a lista com status de conformidade, prazo de início quando existente e link de origem normativa no card de cada obrigação.',
    '{obrigacoes, prazo, origem, norma}',
    '{inicio, status, vigencia, link}',
    'Atlas',
    'OPERACIONAL',
    9,
    true
),
(
    'operacional-radar',
    'Como abrir a fonte oficial de uma norma no Radar?',
    'No módulo Radar, cada item pode trazer URL oficial. Ao abrir o link de fonte, você acessa a publicação de origem para validação do conteúdo.',
    '{radar, fonte oficial, norma}',
    '{url, fonte, link oficial}',
    'Atlas',
    'OPERACIONAL',
    9,
    true
),
(
    'operacional-simulador',
    'Como usar o Simulador Investidor Imobiliário?',
    'No módulo Imobiliário, abra o Simulador Investidor Imobiliário e preencha os campos da operação. Primeiro selecione o cenário. Depois informe dados da transação. Por fim, revise os resultados de Consumo e Renda com comparativos.',
    '{simulador, imobiliario, calculo}',
    '{simulador, investidor, operacao, resultado}',
    'Atlas',
    'OPERACIONAL',
    9,
    true
);
