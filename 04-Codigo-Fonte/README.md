# ATLAS Reforma Tributária — Sistema Interno

> Plataforma web para acompanhamento da Reforma Tributária do Consumo (EC 132/2023).  
> Dados oficiais da [Receita Federal](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-consumo).

---

## 🏗️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Linguagem** | TypeScript |
| **Estilo** | Tailwind CSS |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth (`@supabase/ssr`) |
| **Ícones** | Lucide React |

---

## 📂 Estrutura de Páginas

```
src/app/
├── page.tsx                    # Landing Page (pública)
├── login/page.tsx              # Login com Supabase Auth
├── admin/page.tsx              # Painel Admin (restrito a brendaibiapina@testeatlas.com)
├── preco/page.tsx              # Página de Preço
├── sobre/page.tsx              # Página Sobre
└── dashboard/
    ├── layout.tsx              # Sidebar + navegação (com SidebarAdmin e SidebarUser dinâmicos)
    ├── page.tsx                # Visão Geral (status CBS/IBS/IS + feed de notícias)
    ├── obrigacoes/page.tsx     # Obrigações 2026 (filtráveis por audiência)
    ├── radar/page.tsx          # Radar Oficial (normas + link "Acessar Fonte Oficial")
    ├── timeline/page.tsx       # Timeline da Reforma
    └── imobiliario/page.tsx    # Módulo Imobiliário
```

---

## 🔐 Controle de Acesso

| Rota | Acesso |
|---|---|
| `/`, `/preco`, `/sobre` | Público |
| `/login` | Público (redireciona para `/dashboard` se autenticado) |
| `/dashboard/*` | Requer login via Supabase Auth |
| `/admin` | **Apenas `brendaibiapina@testeatlas.com`** (bloqueado no middleware) |

**3 camadas de proteção do Admin:**
1. `middleware.ts` — bloqueia no servidor
2. `SidebarAdmin.tsx` — esconde o link no menu
3. `SidebarUser.tsx` — mostra e-mail dinâmico do usuário

---

## 🗃️ Banco de Dados (Supabase)

### Tabelas

| Tabela | Descrição |
|---|---|
| `legal_references` | Normas, leis, portarias e notícias oficiais |
| `obligations` | Obrigações tributárias com status e audiência |

### Arquivos SQL

| Arquivo | Função |
|---|---|
| `supabase_setup.sql` | Cria as tabelas + RLS policies |
| `seed_real_data.sql` | Popula com dados oficiais da RFB (16 normas + 12 obrigações) |

### Fonte dos Dados
Todos extraídos de: `gov.br/receitafederal/.../reforma-consumo`
- `/marcos` — EC 132, LC 214, LC 227, Portarias
- `/orientacoes-2026` — Obrigações (NF-e, NFS-e, CT-e, DeRE, DTE, etc.)
- `/noticias` — Notícias oficiais (DeRE, chatbot IA, alerta aluguel, etc.)

---

## 🧩 Serviços (`src/services/`)

| Arquivo | Função | Fallback |
|---|---|---|
| `dashboard.ts` | Status da reforma + feed de notícias | Dados reais da RFB |
| `radar.ts` | Lista de normas com busca | Dados reais da RFB |
| `obligations.ts` | Lista de obrigações | Dados reais da RFB |

> Todos os serviços tentam Supabase primeiro. Se não configurado, usam dados reais hardcoded (não genéricos).

---

## 🚀 Como Rodar

```bash
cd 04-Codigo-Fonte
npm install
nvm use || true   # recomendado: Node 20
npm run dev        # Porta 3000
# ou
npm run dev -- -p 3001  # Porta 3001
```

Faixa recomendada de Node.js: `18`, `20` ou `22`.
Arquivo de referência: `.nvmrc`.

### Variáveis de Ambiente (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
STRIPE_SECRET_KEY=sua-chave-secreta-stripe
STRIPE_WEBHOOK_SECRET=seu-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua-chave-publica-stripe
RESEND_API_KEY=re_xxx
ALERT_FROM_EMAIL=Atlas <alertas@seu-dominio.com>
NEXT_PUBLIC_ADMIN_EMAIL=admin@empresa.com
```

---

## ✅ O que já foi implementado

- [x] Landing Page com seções: Hero, Módulos, Investimento, CTA
- [x] Login com Supabase Auth (email/senha)
- [x] Middleware de proteção de rotas
- [x] Dashboard — Visão Geral (status CBS/IBS/IS + feed)
- [x] Dashboard — Obrigações 2026 (filtros por audiência)
- [x] Dashboard — Radar Oficial (busca + link "Acessar Fonte Oficial")
- [x] Dashboard — Timeline da Reforma
- [x] Dashboard — Módulo Imobiliário
- [x] Admin — Cadastro de Normas e Obrigações (CRUD)
- [x] Admin — Controle de acesso por e-mail
- [x] Sidebar dinâmica (link Admin só para admin, e-mail real do usuário)
- [x] Seed com dados oficiais da RFB (16 normas + 12 obrigações)

## 🧪 Validações Automatizadas

```bash
npm run lint
npm run build
npm run smoke:prod
npm run qa:critical
```

---

## 📋 Próximos Passos (Roadmap)

### Prioridade Alta
- [x] **Alertas por E-mail** — Notificar usuários quando novas normas e obrigações forem publicadas
- [ ] **Módulo Imobiliário com dados reais** — NF-ABI, CBS na locação, critérios PF
- [ ] **Edição de registros no Admin** — Permitir editar (não só criar/excluir)

### Prioridade Média
- [ ] **Perfil do usuário dinâmico** — Nome, cargo, preferências de alerta
- [ ] **Filtros avançados no Radar** — Por fonte, por data, por tag
- [ ] **Busca global** — Pesquisar em normas, obrigações e timeline simultaneamente
- [ ] **Dashboard com métricas reais** — Contadores dinâmicos do Supabase

### Prioridade Baixa (Fase 2)
- [ ] **Multi-tenant** — Múltiplos escritórios com dados separados
- [ ] **Integração com API da RFB** — Busca automática de novas publicações
- [ ] **Base Legal inline** — Texto integral das normas hospedado no Atlas
- [ ] **Comparativo de versões** — Diff visual "antes vs depois" de alterações legais
- [ ] **App mobile** — PWA ou React Native

---

## 📄 Documentação Complementar

| Documento | Local |
|---|---|
| Plano Operacional | `../03-Gestao-Execucao/Operational_Plan.md` |
| Setup do Supabase | `supabase_setup.sql` |
| Dados Iniciais | `seed_real_data.sql` |

`database/schema.sql` e `database/seed.sql` são espelhos simplificados.

---

*Última atualização: 21/02/2026*
