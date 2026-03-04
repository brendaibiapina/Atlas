#!/usr/bin/env node

import { spawn } from 'node:child_process';

const PORT = Number(process.env.PORT || 3011);
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForReady(timeoutMs = 40000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/login`);
      if (res.status === 200) return true;
    } catch {
      // retry
    }
    await delay(800);
  }

  return false;
}

async function checkRoute(pathname, expectedStatuses) {
  const res = await fetch(`${BASE_URL}${pathname}`, { redirect: 'manual' });
  const ok = expectedStatuses.includes(res.status);
  return { ok, status: res.status, pathname, expected: expectedStatuses };
}

async function checkCheckoutValidation() {
  const res = await fetch(`${BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const ok = res.status === 400;
  return { ok, status: res.status, pathname: '/api/checkout (POST sem email)', expected: [400] };
}

function printResult(result) {
  const icon = result.ok ? 'OK' : 'FAIL';
  console.log(`[${icon}] ${result.pathname} -> ${result.status} (esperado: ${result.expected.join(', ')})`);
}

async function main() {
  const server = spawn(
    'npm',
    ['run', 'start', '--', '--port', String(PORT), '--hostname', HOST],
    {
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  let logs = '';
  server.stdout.on('data', (chunk) => {
    logs += String(chunk);
  });
  server.stderr.on('data', (chunk) => {
    logs += String(chunk);
  });

  try {
    const ready = await waitForReady();
    if (!ready) {
      console.error('[FAIL] Servidor de producao nao inicializou no tempo esperado.');
      console.error(logs);
      process.exit(1);
    }

    const checks = await Promise.all([
      checkRoute('/', [200]),
      checkRoute('/sobre', [200]),
      checkRoute('/preco', [200]),
      checkRoute('/inscricao', [200]),
      checkRoute('/login', [200]),
      checkRoute('/dashboard', [302, 307]),
      checkRoute('/dashboard/obrigacoes', [302, 307]),
      checkRoute('/dashboard/radar', [302, 307]),
      checkRoute('/dashboard/imobiliario', [302, 307]),
      checkCheckoutValidation(),
    ]);

    checks.forEach(printResult);

    const failed = checks.filter((item) => !item.ok);
    if (failed.length > 0) {
      console.error(`\n[FAIL] Smoke de producao falhou em ${failed.length} verificacao(oes).`);
      process.exit(1);
    }

    console.log('\n[OK] Smoke de producao concluido sem falhas.');
  } finally {
    try {
      process.kill(server.pid, 'SIGTERM');
    } catch {
      // ignore
    }
  }
}

main().catch((err) => {
  console.error(`[FAIL] Erro inesperado no smoke: ${err?.message || String(err)}`);
  process.exit(1);
});
