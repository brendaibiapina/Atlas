# Plano Operacional: Sistema Interno (Dashboard/SaaS)

Este documento detalha **EXATAMENTE** o que foi vendido e como vamos entregar o "Acesso Vitalício" de forma sustentável e escalável. Focamos na "Bússola Segura" que o cliente comprou.

---

## 1. O Produto Entregável (A "Caixa Preta")

O cliente comprou acesso a um sistema que **filtra o caos**. Ele não quer ver tudo; ele quer ver o que importa.

### 1.1 Módulos Ativos (MVP)
*   **Visão Geral (Home):** Resumo executivo. Status dos 3 impostos (IBS, CBS, IS) e feed de últimas normas.
*   **Obrigações 2026/27:** Checklist interativo. Diferencial: Filtro "Vigente" vs "Educativo" vs "Futuro".
*   **Linha do Tempo (Auditável):** Histórico de versões. "Como era" vs "Como ficou".
*   **Módulo Imobiliário:** Visão segregada para o setor (Alíquotas, Redutores, ITBI).

### 1.2 O Motor Oculto (Back-office)
Para o cliente ver o "Simples", a equipe interna precisa de uma ferramenta robusta de **Curadoria**.
*   **Admin Panel:** Onde o Researcher cadastra a norma.
*   **Tags de Impacto:** O Researcher marca: "Isso afeta Imobiliário?", "Isso gera multa?".

---

## 2. Arquitetura Técnica (Como vai rodar)

Atualmente o sistema roda com dados simulados (`mockData`). O próximo passo é conectar ao "Mundo Real".

### Stack Recomendada (Baixo Custo / Alta Escala)
*   **Frontend:** Next.js 14 (Já implementado).
*   **Banco de Dados:** Postgres (Supabase - Tier Free aguenta até 500MB, suficiente para milhares de normas de texto).
*   **Autenticação:** Supabase Auth (Magic Link ou Google). Mais seguro que senha pura.
*   **Hospedagem:** Vercel (Tier Pro $20/mês se passar dos limites free).

### Fluxo de Dados
1.  **Governo Publica** (DOU/RFB) ->
2.  **Researcher Analisa** (Humano) ->
3.  **Cadastro no Admin** (Supabase Table) ->
4.  **Revalidação Estática** (Next.js ISR) ->
5.  **Cliente Vê Dashboard Atualizado**.

---

## 3. Plano de Implementação (Próximos Passos)

### Fase 1: Conexão com a Realidade (Semana 1)
*   [ ] **Setup Supabase:** Criar projeto e rodar o script SQL (`database/schema.sql`).
*   [ ] **Migração de Dados:** Mover os dados do `mockData.ts` para o Postgres.
*   [ ] **Conexão App:** Configurar Prisma ou Supabase Client no Next.js.
*   [ ] **Página de Login Real:** Substituir o mock por autenticação verdadeira.

### Fase 2: O Painel do Curador (Semana 2)
*   [ ] **Admin Page:** Criar rota `/admin` (protegida) para cadastrar normas.
*   [ ] **Campos de Cadastro:** Título, Resumo, Fonte (Link), Data, Tags (Imobiliário, Jurídico), Status (Vigente/Futuro).
*   [ ] **Disparador de Alertas:** Checkbox "Notificar usuários por e-mail?".

### Fase 3: Refinamento do Produto (Semana 3)
*   [ ] **Filtro de Perfil:** Se o usuário é "Imobiliário", a Home deve priorizar notícias desse setor.
*   [ ] **Busca Inteligente:** Permitir buscar por "Cesta Básica", "Cashback", etc.
*   [ ] **Download de Relatórios:** Botão "Exportar PDF" para o contador mandar pro cliente dele.

---

## 4. Gestão de Acesso e Monetização

### Controle de Acesso
*   **Vitalício:** O usuário recebe uma flag `is_lifetime = true` no banco. Nunca expira.
*   **Assinatura (Futuro):** `subscription_status = 'active'` validado via Stripe/Asaas.

### Gatekeeper (Middleware)
*   Tentou acessar `/dashboard` sem estar logado? -> Redireciona para `/login`.
*   Tentou acessar `/admin` sem ser admin? -> Bloqueio 403.

---

## 5. Rotina Operacional (Ritual)

Para o sistema **não** morrer (o maior risco de SaaS de conteúdo):

1.  **Segunda, Quarta, Sexta (09:00):** Researcher (Brenda/Equipe) lê o DOU.
2.  **Achou Norma Relevante:**
    *   Cadastra no Admin.
    *   Define o "Resumo Curado" (a tradução do juridiquês).
    *   Define o Status (Alerta Amarelo/Vermelho/Verde).
3.  **Publicar:** O sistema atualiza o Dashboard e dispara e-mail (se crítico).

---

**Resumo:** O cliente comprou **Curadoria + Organização**. O sistema interno é a ferramenta que permite entregar essa curadoria em escala, sem precisar mandar WhatsApps individuais.
