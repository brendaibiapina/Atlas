#!/usr/bin/env node

import { spawn } from 'node:child_process';

function run(cmd, args) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { stdio: 'inherit', env: process.env });
    proc.on('close', (code) => resolve(code ?? 1));
  });
}

async function main() {
  const steps = [
    { label: 'Lint', cmd: 'npm', args: ['run', 'lint'] },
    { label: 'Testes de dominio', cmd: 'npm', args: ['run', 'test:domain'] },
    { label: 'Build', cmd: 'npm', args: ['run', 'build'] },
    { label: 'Smoke Producao', cmd: 'npm', args: ['run', 'smoke:prod'] },
  ];

  for (const step of steps) {
    console.log(`\n>>> ${step.label}`);
    const code = await run(step.cmd, step.args);
    if (code !== 0) {
      console.error(`\n[FAIL] ${step.label} falhou com codigo ${code}.`);
      process.exit(code);
    }
  }

  console.log('\n[OK] Validacao critica automatizada concluida.');
}

main().catch((err) => {
  console.error(`[FAIL] Erro na validacao critica: ${err?.message || String(err)}`);
  process.exit(1);
});
