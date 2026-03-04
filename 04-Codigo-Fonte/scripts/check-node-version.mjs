#!/usr/bin/env node

const major = Number(process.versions.node.split('.')[0]);
const min = 18;
const maxExclusive = 23;
const strict = process.env.ATLAS_STRICT_NODE === '1';

if (Number.isNaN(major) || major < min || major >= maxExclusive) {
  const message = `Versao do Node fora da faixa recomendada: ${process.versions.node}. Faixa recomendada: 18, 20 ou 22.`;
  if (strict) {
    console.error(message);
    process.exit(1);
  }
  console.warn(message);
  process.exit(0);
}

console.log(`Node ${process.versions.node} validado para execucao do Atlas.`);
