# Plano Operacional — Atlas da Reforma Tributária

Este documento estrutura a "máquina" que fará o Atlas funcionar, desde a construção até a rotina diária de atualizações e venda.

---

## 1. Roadmap de Desenvolvimento (MVP em 4 Semanas)

**Objetivo:** Ter o produto vendável e funcional (mesmo que com cadastro manual de normas) em 30 dias.

| Sprint | Foco | Entregáveis |
| :--- | :--- | :--- |
| **Semana 1** | **Fundação** | • Configuração do Banco de Dados (Postgres).<br>• Setup do Auth (Login/Senha/Magic Link).<br>• Tabela `LegalReference` e `Obligation` funcionais. |
| **Semana 2** | **Back-office** | • Painel Admin (simples) para o Researcher cadastrar normas.<br>• Sistema de Tags/Filtros.<br>• Feed "Radar" (Frontend). |
| **Semana 3** | **Frontend User** | • Dashboard (Home).<br>• Checklist "Obrigações 2026".<br>• Módulo Imobiliário (Visualização). |
| **Semana 4** | **Alertas & Polimento** | • Motor de Disparo de E-mails (SendGrid/Resend).<br>• Integração com Stripe/Pagar.me (Checkout).<br>• Teste E2E da Trilha Auditável. |

---

## 2. Content Ops (A Rotina de Pesquisa)

O valor do Atlas é a **Curadoria**. A tecnologia é apenas o meio. A rotina do Researcher Jurídico é o coração do produto.

### Rotina Diária (O "Daily Scan") — 08:00 às 10:00
1.  **Monitoramento:**
    *   Leitura dinâmica do DOU (Seção 1 - Economia/Fazenda).
    *   Checagem no site da Câmara (Tramitação de PLPs).
    *   Checagem no Portal RFB/Sped.
2.  **Triagem:**
    *   Achou algo? É relevante? (Sim/Não).
    *   Se Sim: Cadastrar no Atlas com status (Vigente/Em Construção).
3.  **Disparo:**
    *   Se for "Urgente" (ex: Nova LC): Escrever e disparar alerta imediato.
    *   Se for "Rotina" (ex: Nota Técnica menor): Agendar para o Digest Semanal.

### Rotina Semanal (Sexta-feira) — 14:00 às 16:00
1.  **Revisão Cruzada:** Verificar se algum status mudou (ex: um prazo vence na próxima segunda?).
2.  **Digest:** Redigir o e-mail de resumo semanal ("O que você perdeu essa semana").
3.  **Módulo Imobiliário:** Verificar sites de entidades (CBIC, Secovi) por novidades setoriais.

---

## 3. Tech Stack & Infraestrutura (Custo-Eficiente)

Foco em baixo custo fixo inicial. Escalar só quando a receita entrar.

*   **Frontend:** Next.js (Hospedagem Vercel - Tier Free/Pro).
*   **Backend:** Next.js Server Actions ou Supabase (Backend-as-a-Service).
*   **Banco de Dados:** Postgres (Supabase ou Neon - Tier Free/Pro).
*   **Auth:** Supabase Auth ou Clerk.
*   **E-mails:** Resend (Melhor DX) ou AWS SES (Mais barato em escala).
*   **Pagamentos:** Stripe (Global/Simples) ou Asaas (Nacional/Boleto/Pix nativo).
*   **CMS Interno:** Próprio (admin do Next.js) ou Retool (para agilizar).

**Custo Estimado (MVP):** ~$50 USD/mês (infra) + Domínio.

---

## 4. Go-To-Market (Estratégia de Lançamento)

**Preço:** R$ 89,90 (Vitalício para MVP - "Early Adopter") -> Depois R$ 89,90/ano.
**Promessa:** "Garanta acesso vitalício enquanto construímos o mapa definitivo."

### Fase 1: Alpha (Friends & Family) - Sem 1 e 2
*   **Público:** 10 a 20 Contadores próximos.
*   **Ação:** Acesso gratuito em troca de feedback brutal sobre a usabilidade.
*   **Meta:** Validar se o "Checklist 2026" está útil.

### Fase 2: Beta Fechado (Waitlist) - Sem 3 e 4
*   **Canal:** LinkedIn (Perfil Brenda) + Grupos de WhatsApp de Tributário.
*   **Mensagem:** "Estou montando um painel só com fontes oficiais da Reforma. Sem ruído. Quem quer testar?"
*   **Landing Page:** Simples. "Atlas da Reforma". Captura e-mail.

### Fase 3: Lançamento Público (O "Big Bang") - Mês 2
*   **Webinar:** "O Mapa Definitivo das Obrigações 2026 (Sem achismos)".
*   **Oferta:** Apresentar o painel ao vivo monitorando o DOU. Vender o acesso vitalício por 48h.
*   **Criativos:** Prints do painel mostrando "Obrigações educacionais vs Reais".

---

## 5. Suporte & Customer Success
*   **Regra de Ouro:** Não damos consultoria tributária.
*   **Ticket Tipo 1 (Técnico):** "Não consegui logar" -> Suporte Dev.
*   **Ticket Tipo 2 (Conteúdo):** "Achei essa norma errada" -> Researcher revisa.
*   **Ticket Tipo 3 (Dúvida):** "Como aplico isso no meu cliente?" -> **Template de Resposta:** "O Atlas é uma ferramenta de pesquisa. Recomendamos consultar a LC 214 no link X. Não oferecemos parecer jurídico."
