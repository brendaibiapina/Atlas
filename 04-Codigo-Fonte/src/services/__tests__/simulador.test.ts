import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularSimulador, criarInputDefaultSimulador } from '../imobiliario';

test('locacao PF abaixo do limite legal nao aplica IBS/CBS', () => {
  const input = criarInputDefaultSimulador();
  input.operacao = 'LOCACAO';
  input.perfil = 'PF';
  input.pf_acima_limite_legal = false;
  input.valor_locacao = 20000;

  const resultado = calcularSimulador(input);

  assert.equal(resultado.enquadramento.status, 'NAO_ELEGIVEL');
  assert.equal(resultado.consumo.imposto, 0);
  assert.ok(resultado.renda.imposto_total > 0);
});

test('locacao PF acima do limite legal aplica IBS/CBS', () => {
  const input = criarInputDefaultSimulador();
  input.operacao = 'LOCACAO';
  input.perfil = 'PF';
  input.pf_acima_limite_legal = true;
  input.valor_locacao = 30000;

  const resultado = calcularSimulador(input);

  assert.equal(resultado.enquadramento.status, 'ELEGIVEL');
  assert.ok(resultado.consumo.imposto > 0);
});

test('alienacao calcula margem de consumo separada do ganho de renda', () => {
  const input = criarInputDefaultSimulador();
  input.operacao = 'ALIENACAO';
  input.perfil = 'PJ';
  input.natureza_bem_pj = 'IMOBILIZADO_INVESTIMENTO';
  input.valor_venda = 1000000;
  input.custo_aquisicao = 650000;
  input.despesas_elegiveis = 10000;
  input.redutor_ajuste_itens = [
    {
      id: 'item-1',
      data_evento: '2024-01-01',
      tipo_evento: 'ITBI',
      valor_evento: 15000,
      fator_atualizacao: 1,
      elegivel: true,
    },
  ];

  const resultado = calcularSimulador(input);

  assert.ok(resultado.bases_alienacao);
  assert.equal(resultado.consumo.base, resultado.bases_alienacao!.margem_utilizada);
  assert.ok(resultado.bases_alienacao!.ganho_pj > 0);
  assert.ok(resultado.total > 0);
});
