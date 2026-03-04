import test from 'node:test';
import assert from 'node:assert/strict';
import { answerFAQQuestion } from '../faq-chat';

test('faq chat retorna EMPTY_QUESTION para entrada vazia', async () => {
  const resposta = await answerFAQQuestion('   ');

  assert.equal(resposta.reason, 'EMPTY_QUESTION');
  assert.equal(resposta.can_answer, false);
});

test('faq chat responde pergunta com lastro interno', async () => {
  const resposta = await answerFAQQuestion('A partir de quantos imóveis em aluguel incidirá IBS e CBS?');

  assert.equal(resposta.reason, 'FOUND');
  assert.equal(resposta.can_answer, true);
  assert.ok(Boolean(resposta.source?.id));
});
