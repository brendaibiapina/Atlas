# Atlas — Setup Rápido

## 1. Instalar dependências

```bash
cd 04-Codigo-Fonte
npm install
nvm use || true
```

Use preferencialmente Node `20` (faixa suportada: 18, 20, 22).

## 2. Configurar ambiente

```bash
cp .env.example .env.local
```

Preencha as variáveis obrigatórias no `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ALERT_FROM_EMAIL`
- `NEXT_PUBLIC_ADMIN_EMAIL`

## 3. Banco (Supabase)

Execute no SQL editor:

1. `supabase_setup.sql`
2. `seed_real_data.sql` (opcional, para dados iniciais)

## 4. Rodar localmente

```bash
npm run dev
```

## 5. Verificações recomendadas

```bash
npm run lint
npm run build
npm run smoke:prod
npm run qa:critical
```
