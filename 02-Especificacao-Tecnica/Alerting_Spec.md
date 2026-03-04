# Lógica de Alertas e Templates de E-mail

## 1. Regras de Disparo (Triggers)

O sistema monitora a tabela `LegalReference` e `Event`.

### Regra A: Nova Norma Publicada (Urgente)
*   **Gatilho:** Inserção de novo registro em `LegalReference` com `status = VIGENTE`.
*   **Público:** Usuários com a Tag do Tema (ex: #IBS) ou #Geral.
*   **Frequência:** Imediato (se configurado) ou Digest Diário.

### Regra B: Mudança de Status (Monitoramento)
*   **Gatilho:** Alteração de `compliance_status` em `Obligation`.
    *   Ex: "Em Construção" -> "Educativo".
*   **Ação:** Dispara e-mail "Obrigação Ativada".

### Regra C: Contagem Regressiva (Timeline)
*   **Gatilho:** `Event.event_date` = Hoje + 30 dias.
*   **Ação:** Alerta de "Prazo se aproximando".

### Regra D: Janela Educativa (Fim da Graça)
*   **Gatilho:** `Obligation.penalty_grace_period_end` = Hoje + 15 dias.
*   **Ação:** Alerta Vermelho "Fim do Período sem Multa".

---

## 2. Tipos de E-mail

### A. Alerta Imediato (Breaking News)
*usado para LCs, Atos do CGIBS e Notas Técnicas relevantes.*

**Assunto:** [ATLAS] Nova publicação oficial: Ato CGIBS nº 1
**Preheader:** Define regras de transição e período sem multa.

**Corpo:**
> **O que aconteceu:**
> Publicado hoje no DOU o Ato Conjunto RFB/CGIBS nº 1.
>
> **Por que importa:**
> Define que 2026 terá caráter educativo. Não haverá multas por erros de preenchimento nos primeiros 3 meses após regulamentação.
>
> **Ação Recomendada:**
> [ ] Atualizar parâmetros do ERP (se disponível).
> [ ] Comunicar clientes sobre o teste em jan/2026.
>
> [Ler Fonte Oficial no Atlas >]

---

### B. Digest Semanal (Resumo)
*usado para atualizações menores e lembretes.*

**Assunto:** [ATLAS] Resumo da Semana: 2 novidades no IBS
**Corpo:**
> Olá, Brenda.
>
> Sua semana em 30 segundos:
>
> **Normas Publicadas:**
> *   (23/12) Ato RFB/CGIBS nº 1: Transição e Prazos.
>
> **Obrigações no Radar:**
> *   Destaque de IBS/CBS na NF-e: [Status: Educativo]
>
> [Acessar Painel Completo >]
