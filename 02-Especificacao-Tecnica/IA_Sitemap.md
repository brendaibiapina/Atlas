# Arquitetura de Informação & Sitemap — Atlas

## 1. Estrutura de Navegação (Sitemap)

### A. Público: Contador & Advogado (Visão Geral)

*   **Login / Onboarding**
    *   Seleção de Perfil (Contador | Advogado | Imobiliário)
    *   Setup Inicial (Preferência de Alertas, Temas de Interesse)

*   **Dashboard (Home)**
    *   Resumo "O que mudou na última semana"
    *   Status dos Principais Marcos (Ex: "Regulamentação IBS: Em atraso")
    *   Atalho: "Obrigações 2026"

*   **Menu Principal (Lateral/Topo)**
    1.  **Visão Geral** (Home)
    2.  **Obrigações 2026** (Checklist Operacional)
        *   *Filtro:* Por Documento (NF-e, NFC-e, etc.)
        *   *Filtro:* Status (Vigente, Educativo, Futuro)
    3.  **Timeline Oficial** (Cronograma)
        *   Visualização de Prazos Legais e Estimados
    4.  **Radar de Atualizações** (Feed Legislativo)
        *   Atos do DOU / Câmara / RFB
        *   Busca e Filtros Avançados
    5.  **Base Legal** (Biblioteca)
        *   Índice por Tema (IBS, CBS, IS, Zona Franca...)
        *   Link direto para LCs e Atos
    6.  **Módulo Imobiliário** (Expansão)
        *   Painel específico para tributação de imóveis

*   **Menu de Usuário**
    *   Configuração de Alertas (E-mail frequência)
    *   Perfil e Assinatura

---

## 2. Fluxos Principais

### Fluxo 1: Verificação de Rotina (Contador)
1.  **Entrada:** E-mail de "Resumo Semanal".
2.  **Ação:** Clica em "Ver detalhes" de uma nova Nota Técnica.
3.  **Destino:** Abre o **Radar de Atualizações** filtrado na norma.
4.  **Ação Secundária:** Marca como "Lido" ou "Adicionar a Tarefas".
5.  **Saída:** Vai para **Obrigações 2026** conferir se algo mudou no checklist.

### Fluxo 2: Pesquisa Jurídica (Advogado)
1.  **Entrada:** Login direto.
2.  **Navegação:** Clica em **Base Legal**.
3.  **Busca:** Digita "Cashback".
4.  **Resultado:** Vê a LC 214/2025 (Artigos específicos) + Atos Regulamentares (se houver).
5.  **Verificação:** Confere o status "Aguardando Regulamentação" no card do tema.

### Fluxo 3: Acesso Imobiliário (Corretor/Investidor)
1.  **Entrada:** Login (Perfil Imobiliário pré-selecionado).
2.  **Home:** Dashboard focado em ITBI, Alíquotas de Referência Imobiliária e Redutores.
3.  **Alerta:** Vê aviso sobre "Mudança no ITBI (PLP X)".
