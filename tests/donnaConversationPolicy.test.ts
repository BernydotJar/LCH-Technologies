import assert from 'node:assert/strict';
import test from 'node:test';
import {
  contactAnswerFeedback, contactIntro, contactProgressLabel, isDirectContactIntent,
  isSensitiveContactText, safeKnowledgeHistory,
} from '../src/donna/conversationPolicy.ts';
import { contextualPrompts } from '../src/donna/experience.ts';
import { respondToDonna } from '../src/donna/engine.ts';

test('GH-23 recognizes explicit intent to be contacted without inferring one from normal questions', () => {
  for (const message of [
    'Quiero hablar con el equipo de LCH',
    'Necesito agendar una reunión',
    'Me gustaría una cotización',
    'Quiero preparar el formulario',
    'Quiero que me contacten',
    'Necesito hablar con una persona',
    'Podemos agendar una llamada',
  ]) assert.equal(isDirectContactIntent(message), true, message);

  for (const message of [
    '¿Qué es LUMA?',
    'Quiero automatizar facturas',
    '¿Cuánto cuesta LUMA?',
    'Quiero saber cómo automatizar procesos',
    '¿Cómo funciona la IA?',
    '¿Qué es la política de privacidad?',
    'Quiero consultar evidencia jurídica',
    'Quiero hablar de IA aplicada',
    'Necesito conversar sobre automatización de facturas',
    '¿Cómo puedo contactar a LCH?',
  ]) assert.equal(isDirectContactIntent(message), false, message);
});

test('GH-23 unknown questions ask a helpful follow-up without a forced contact link', () => {
  const reply = respondToDonna([{ role: 'user', content: '¿Tienen oficina en Lima y cuál es su extensión?' }]);
  assert.equal(reply.kind, 'clarify');
  assert.equal(reply.links.length, 0);
  assert.match(reply.reply, /automatización|inteligencia artificial/);
  assert.ok(contextualPrompts(reply.kind, reply.suggestedInterest, '').length >= 2);
  for (const prompt of contextualPrompts(reply.kind, reply.suggestedInterest, '')) {
    const related = respondToDonna([{ role: 'user', content: prompt.message }]);
    assert.equal(related.kind, 'grounded', prompt.message);
  }
});

test('GH-23 pricing stays candid and never auto-starts contact intake', () => {
  assert.equal(isDirectContactIntent('¿Cuánto cuesta integrar LUMA?'), false);
  const reply = respondToDonna([{ role: 'user', content: '¿Cuánto cuesta integrar LUMA?' }]);
  assert.equal(reply.kind, 'decline');
  assert.deepEqual(contextualPrompts(reply.kind, reply.suggestedInterest, ''), []);
  assert.doesNotMatch(reply.reply, /\$\d+/u);
});

test('GH-23 concise contact introduction has one question and no zero-data counter', () => {
  const initial = contactIntro({});
  assert.match(initial, /¿Cuál es tu nombre\?/u);
  assert.doesNotMatch(initial, /0 datos|identifiqué 0/iu);
  assert.equal(contactProgressLabel({}), 'Empecemos');
  assert.match(contactIntro({ nombre: 'Ana', apellido: 'Perez' }), /correo electrónico/iu);
  assert.equal(contactProgressLabel({ nombre: 'Ana', apellido: 'Perez' }), '2/6 datos');
  const ready = {
    nombre: 'Ana', apellido: 'Perez', email: 'ana@example.com',
    empresa: 'Acme', cargo: 'Gerente', interes: 'Automatización' as const,
  };
  assert.equal(contactProgressLabel(ready), 'Datos listos');
  assert.match(contactIntro(ready), /revisarlos/);
});

test('GH-23 guided feedback asks missing fields once without inventing user data', () => {
  assert.match(contactAnswerFeedback({ nombre: 'Ana' }, true), /apellido/iu);
  assert.doesNotMatch(contactAnswerFeedback({ nombre: 'Ana' }, true), /datos|tenemos/iu);
  assert.match(contactAnswerFeedback({ nombre: 'Ana' }, false), /validar/iu);
  assert.match(contactAnswerFeedback({ nombre: 'Ana' }, false, true), /no forma parte/iu);
});

test('GH-23 private guided history never crosses the boundary back into knowledge chat', () => {
  const mixed = [
    { role: 'user' as const, content: '¿Qué es LUMA?' },
    { role: 'assistant' as const, content: 'LUMA es una experiencia de aprendizaje inteligente.' },
    { role: 'user' as const, content: 'Me llamo Ana Perez y mi correo es ana.privada@example.com', private: true },
    { role: 'assistant' as const, content: '¿En qué organización trabajas?', private: true },
    { role: 'user' as const, content: 'Acme Labs', private: true },
    { role: 'assistant' as const, content: 'Anotado. ¿Cuál es tu cargo?', private: true },
    { role: 'user' as const, content: 'Mi teléfono es 68899999' },
    { role: 'user' as const, content: '¿Qué hace I-DO?' },
  ];
  const safe = safeKnowledgeHistory(mixed, 20);
  assert.deepEqual(safe.map((item) => item.content), [
    '¿Qué es LUMA?',
    'LUMA es una experiencia de aprendizaje inteligente.',
    '¿Qué hace I-DO?',
  ]);
  assert.doesNotMatch(JSON.stringify(safe), /Ana|Acme|68899999|privada|cargo/iu);
  assert.deepEqual(safeKnowledgeHistory([{ role: 'user', content: '¿Qué es LUMA?' }], 1), [
    { role: 'user', content: '¿Qué es LUMA?' },
  ]);
});

test('GH-23 sensitive turn classification is bounded: identity data yes, business questions no', () => {
  assert.equal(isSensitiveContactText('Me llamo Ana Perez'), true);
  assert.equal(isSensitiveContactText('Mi correo es ana@example.com'), true);
  assert.equal(isSensitiveContactText('Mi teléfono es 68899999'), true);
  assert.equal(isSensitiveContactText('Soy Ana Perez'), true);
  assert.equal(isSensitiveContactText('¿Cómo puede la IA ayudar con documentos?'), false);
});

test('GH-23 HTML-free contact knowledge remains specific when asked where to reach LCH', () => {
  const response = respondToDonna([{ role: 'user', content: '¿Cómo puedo contactar a LCH?' }]);
  assert.equal(response.kind, 'grounded');
  assert.equal(response.links.length, 1);
  assert.equal(response.links[0].url, '#contacto');
  assert.match(response.reply, /formulario/iu);
});
