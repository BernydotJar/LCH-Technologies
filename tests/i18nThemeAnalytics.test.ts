import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  normalizeLocale, pageMetadata, selectInitialLocale, translate, translationExists,
} from '../src/i18n/messages.ts';
import { parseDonnaRequest, respondToDonna } from '../src/donna/engine.ts';
import { respondToDonnaLocalized } from '../src/donna/localized.ts';
import { renderLocalizedHead } from '../server/localizedHead.ts';
import {
  localContactFeedback, localContactIntro, localContactProgress, localContactQuestion,
  localizedInterestAnswer,
} from '../src/donna/localContact.ts';
import { isDirectContactIntent, safeKnowledgeHistory } from '../src/donna/conversationPolicy.ts';
import { containsOutOfSchemaPrivateData, containsPersonalContactData } from '../src/contact/semanticDraft.ts';
import { getConsent, validMeasurementId } from '../src/analytics/client.ts';

test('language choice prioritizes explicit URL, then saved choice, then browser language, then Spanish', () => {
  assert.equal(normalizeLocale('en-US'), 'en');
  assert.equal(normalizeLocale('PT_br'), 'pt');
  assert.equal(normalizeLocale('fr'), null);
  assert.equal(selectInitialLocale('pt', 'en', 'es-GT'), 'pt');
  assert.equal(selectInitialLocale(null, 'en', 'es-GT'), 'en');
  assert.equal(selectInitialLocale(null, null, 'pt-BR'), 'pt');
  assert.equal(selectInitialLocale(null, null, 'fr-FR'), 'es');
  assert.equal(selectInitialLocale('fr', 'pt', 'en-US'), 'pt');
});

test('key public LCH copy has real ES/EN/PT translations without changing technical names', () => {
  assert.equal(translate('es', 'Conversemos'), 'Conversemos');
  assert.equal(translate('en', 'Conversemos'), "Let's talk");
  assert.equal(translate('pt', 'Conversemos'), 'Vamos conversar');
  assert.match(translate('en', 'Construimos tecnología orientada a resultados operacionales.'), /operational outcomes/);
  assert.match(translate('pt', 'Construimos tecnología orientada a resultados operacionales.'), /resultados operacionais/);
  for (const source of [
    'El próximo avance comienza con una conversación.',
    'Cuéntanos qué quieres lograr',
    'Tu privacidad importa',
    'LCH Technologies — Inicio',
    'Recibimos tu solicitud',
    'Automatización',
    'Metodología de Ingeniería',
    'Problemas que ya hemos resuelto.',
    'Las ideas son fáciles. Los productos funcionando, no tanto. Explora sistemas que LCH ya convirtió en software real.',
    'Hola, soy Donna.',
  ]) {
    assert.equal(translationExists(source), true, source);
    for (const locale of ['en', 'pt'] as const) {
      assert.ok(translate(locale, source).length > 0);
      assert.notEqual(translate(locale, source), source, source + ' ' + locale);
    }
  }
  for (const locale of ['es', 'en', 'pt'] as const) {
    assert.match(pageMetadata[locale].title, /LCH Technologies/);
    assert.ok(pageMetadata[locale].description.length > 70);
  }
});

test('server-rendered HTML metadata and hreflang remain correct for each language', () => {
  const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const locale of ['es', 'en', 'pt'] as const) {
    assert.match(index, new RegExp('hreflang="' + locale + '"'));
  }
  assert.match(index, /hreflang="x-default"/);
  const es = renderLocalizedHead(index, 'es');
  assert.equal(es, index);
  const en = renderLocalizedHead(index, 'en');
  assert.match(en, /<html lang="en">/);
  assert.match(en, /<title>LCH Technologies \| AI, Automation, Software &amp; Cloud<\/title>/);
  assert.match(en, /rel="canonical" href="https:\/\/lch-app.cloud\/\?lang=en"/);
  assert.match(en, /property="og:locale" content="en_US"/);
  assert.match(en, /property="og:url" content="https:\/\/lch-app.cloud\/\?lang=en"/);
  const pt = renderLocalizedHead(index, 'pt');
  assert.match(pt, /<html lang="pt">/);
  assert.match(pt, /property="og:locale" content="pt_BR"/);
  assert.match(pt, /rel="canonical" href="https:\/\/lch-app.cloud\/\?lang=pt"/);
  assert.equal(renderLocalizedHead(index, '../../etc'), index);
});

test('Donna preserves Spanish behavior and routes reviewed EN/PT public answers', () => {
  const question = [{ role: 'user' as const, content: '¿Qué es LUMA?' }];
  assert.deepEqual(respondToDonnaLocalized(question, 'es'), respondToDonna(question));
  const en = respondToDonnaLocalized([{ role: 'user', content: 'automate invoices' }], 'en');
  assert.equal(en.kind, 'grounded');
  assert.match(en.reply, /automation|manual work/i);
  assert.doesNotMatch(en.reply, /automatización|solicitud/i);
  const pt = respondToDonnaLocalized([{ role: 'user', content: 'automação de processos' }], 'pt');
  assert.equal(pt.kind, 'grounded');
  assert.match(pt.reply, /automações/i);
  const hello = respondToDonnaLocalized([{ role: 'user', content: 'Olá!' }], 'pt');
  assert.equal(hello.kind, 'greeting');
  assert.match(hello.reply, /Olá!/);
  const prices = respondToDonnaLocalized([{ role: 'user', content: 'How much does it cost?' }], 'en');
  assert.equal(prices.kind, 'decline');
  assert.match(prices.reply, /pricing/);
  const privateReply = respondToDonnaLocalized([{ role: 'user', content: 'my password' }], 'en');
  assert.equal(privateReply.kind, 'redirect');
  assert.match(privateReply.reply, /cannot access accounts/);
});

test('Donna request locale is strictly bounded; no locale keeps legacy response schema', () => {
  const input = { messages: [{ role: 'user', content: 'automation' }] };
  assert.equal(parseDonnaRequest({ ...input, locale: 'pt' }).ok, true);
  assert.deepEqual(parseDonnaRequest(input), { ok: true, messages: input.messages });
  assert.equal(parseDonnaRequest({ ...input, locale: 'unsupported' }).ok, false);
  assert.equal(parseDonnaRequest({ ...input, locale: { lang: 'en' } }).ok, false);
});

test('guided contact works across languages but keeps canonical form fields and consent private', () => {
  assert.match(localContactIntro('en', {}), /first name/);
  assert.match(localContactIntro('pt', {}), /nome/);
  assert.match(localContactFeedback('en', { nombre: 'Ana' }, true), /last name/);
  assert.equal(localContactProgress('pt', {}), 'Vamos começar');
  assert.equal(localContactQuestion('pt', 'email'), 'Em qual e-mail podemos responder?');
  assert.deepEqual(localizedInterestAnswer('en', 'interes', 'automation'), { interes: 'Automatización' });
  assert.deepEqual(localizedInterestAnswer('pt', 'interes', 'nuvem'), { interes: 'Cloud' });
  assert.deepEqual(localizedInterestAnswer('en', 'interes', 'unknown arbitrary value'), {});
  assert.deepEqual(localizedInterestAnswer('en', 'cargo', 'Software Engineer'), { cargo: 'Software Engineer' });
  assert.equal(isDirectContactIntent('I want to talk to your team'), true);
  assert.equal(isDirectContactIntent('Quero falar com a equipe'), true);
  assert.equal(isDirectContactIntent('How does AI work?'), false);
});

test('EN/PT private details are isolated from public Donna chat history', () => {
  assert.equal(containsPersonalContactData('My name is John Doe'), true);
  assert.equal(containsPersonalContactData('Meu nome é João Silva'), true);
  assert.equal(containsPersonalContactData('Meu telefone é 555-1912'), true);
  assert.equal(containsOutOfSchemaPrivateData('my phone number is 555-1912'), true);
  assert.equal(containsOutOfSchemaPrivateData('minha senha é secreta'), true);
  const safe = safeKnowledgeHistory([
    { role: 'user', content: 'my name is John Doe' },
    { role: 'user', content: 'Meu nome é João Silva' },
    { role: 'user', content: 'My phone number is 555-1912' },
    { role: 'user', content: 'What does LUMA do?' },
  ], 20);
  assert.deepEqual(safe, [{ role: 'user', content: 'What does LUMA do?' }]);
});

test('GA4 requires an explicit valid configuration and begins with no Node-side consent', () => {
  assert.equal(validMeasurementId('G-ABC12345'), true);
  assert.equal(validMeasurementId('UA-12345-6'), false);
  assert.equal(validMeasurementId('javascript:alert(1)'), false);
  assert.equal(validMeasurementId(''), false);
  assert.equal(getConsent(), null);
});
