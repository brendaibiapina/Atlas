# 🎯 ATLAS — Sistema de Agentes de Automação

Sistema de coleta automática de dados da Reforma Tributária do Consumo.

---

## Como Usar

### 1. Instalar dependências

```bash
cd 05-Agentes
pip install -r requirements.txt
```

### 2. Configurar Supabase (opcional para dry-run)

```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

Os agentes também leem automaticamente `../04-Codigo-Fonte/.env.local` quando disponível.

### 3. Executar

```bash
# Modo interativo
python orchestrator.py

# Ou via comandos diretos
python orchestrator.py listar
python orchestrator.py rodar rfb_news
python orchestrator.py rodar-todos
python orchestrator.py status
python orchestrator.py nova-tarefa

# Execução para CI/CD
python run_ci.py --mode daily
python run_ci.py --mode entenda
python run_ci.py --mode all
```

---

## 🤖 Sub-agentes Disponíveis

| Agente | Fonte | Frequência | O que coleta |
|---|---|---|---|
| `rfb_news` | [Notícias RFB](https://www.gov.br/receitafederal/.../reforma-consumo/noticias) | Diário | Notícias oficiais |
| `rfb_marcos` | [Marcos Regulatórios](https://www.gov.br/receitafederal/.../reforma-consumo/marcos) | Semanal | ECs, LCs, Portarias |
| `rfb_orientacoes` | [Orientações 2026](https://www.gov.br/receitafederal/.../reforma-consumo/orientacoes-2026) | Semanal | Obrigações acessórias |
| `system_design_squad` | Código local do projeto | Semanal | Diagnóstico de arquitetura e design de sistemas com relatório em `logs/reports` |

---

## 📂 Estrutura

```
05-Agentes/
├── orchestrator.py        # CLI interativo
├── config.py              # Configurações + Supabase
├── registry.json          # Registro de agentes
├── agents/
│   ├── base_agent.py      # Classe base (fetch→parse→dedup→save)
│   ├── rfb_news_agent.py
│   ├── rfb_marcos_agent.py
│   ├── rfb_orientacoes_agent.py
│   └── system_design_squad_agent.py
├── utils/
│   ├── scraper.py         # HTTP com anti-bot headers
│   └── parser.py          # Parse de HTML, datas, tags
└── logs/                  # Logs diários
```

---

## 🔧 Criar Novo Sub-agente

```bash
python orchestrator.py nova-tarefa
```

O orquestrador pergunta:
1. **O que você faz manualmente?**
2. **Qual a URL da fonte?**
3. **Com que frequência?**
4. **Para qual tabela no Supabase?**

E gera automaticamente o arquivo Python do novo agente + registra no `registry.json`.

---

## ⚠️ Notas

- Sem Supabase configurado, roda em **DRY-RUN** (mostra o que faria, sem inserir)
- A deduplicação é por **título** — nunca insere registros duplicados
- Logs são salvos em `logs/agentes_YYYY-MM-DD.log`

---

*Última atualização: 19/02/2026*
