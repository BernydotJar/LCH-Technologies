import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildLeadAutomationPayload,
  scoreLead,
  validateDemoRequest,
  type DemoRequest,
} from '../src/integrations/leadContract.ts';
import { notifyLeadAutomation } from '../src/integrations/leadAutomation.ts';

const baseRequest: DemoRequest = {
  nombre: '  Ada  ',
  apellido: '  Lovelace ',
  email: ' ADA@ExampleCorp.COM ',
  empresa: ' Example Corp ',
  cargo: ' Chief Technology Officer ',
  interes: 'Inteligencia Artificial',
  mensaje: ' Queremos automatizar la revisión y aprobación de contratos empresariales. ',
  consentimiento: true,
};

test('normalizes and validates an accepted demo request', () => {
  const result = validateDemoRequest(baseRequest);
  assert.equal(result.valid, true);
  if (!result.valid) return;

  assert.equal(result.value.nombre, 'Ada');
  assert.equal(result.value.apellido, 'Lovelace');
  assert.equal(result.value.email, 'ada@examplecorp.com');
  assert.equal(result.value.empresa, 'Example Corp');
  assert.equal(result.value.cargo, 'Chief Technology Officer');
});

test('rejects missing consent, invalid email, invalid interest, and oversized message', () => {
  const result = validateDemoRequest({
    ...baseRequest,
    email: 'not-an-email',
    interes: 'Unknown',
    mensaje: 'x'.repeat(2001),
    consentimiento: false,
  });

  assert.equal(result.valid, false);
  if (result.valid) return;
  assert.deepEqual(result.errors.sort(), [
    'consentimiento is required',
    'email is invalid',
    'interes is invalid',
    'mensaje is too long',
  ]);
});

test('scores a qualified enterprise lead deterministically', () => {
  const validation = validateDemoRequest(baseRequest);
  assert.equal(validation.valid, true);
  if (!validation.valid) return;

  const score = scoreLead(validation.value);
  assert.equal(score.score, 10);
  assert.equal(score.priority, 'HOT');
  assert.deepEqual(score.reasons, [
    'corporate_email',
    'decision_maker_role',
    'strategic_interest',
    'described_operational_challenge',
    'company_identified',
  ]);
});

test('keeps a low-signal free-email lead deterministic', () => {
  const validation = validateDemoRequest({
    ...baseRequest,
    email: 'person@gmail.com',
    cargo: 'Analista',
    interes: 'Cloud',
    mensaje: '',
  });
  assert.equal(validation.valid, true);
  if (!validation.valid) return;

  const score = scoreLead(validation.value);
  assert.equal(score.score, 1);
  assert.equal(score.priority, 'LOW');
  assert.deepEqual(score.reasons, ['company_identified']);
});

test('builds a stable automation payload keyed by Firestore leadId', () => {
  const validation = validateDemoRequest(baseRequest);
  assert.equal(validation.valid, true);
  if (!validation.valid) return;

  const payload = buildLeadAutomationPayload(
    'lead-123',
    validation.value,
    '2026-08-12T20:00:00.000Z',
  );

  assert.equal(payload.schemaVersion, 'lch.lead.v1');
  assert.equal(payload.leadId, 'lead-123');
  assert.equal(payload.source, 'website');
  assert.equal(payload.status, 'new');
  assert.equal(payload.submittedAt, '2026-08-12T20:00:00.000Z');
});

test('skips automation when no webhook is configured', async () => {
  const validation = validateDemoRequest(baseRequest);
  assert.equal(validation.valid, true);
  if (!validation.valid) return;

  const payload = buildLeadAutomationPayload('lead-123', validation.value);
  assert.deepEqual(await notifyLeadAutomation(undefined, payload), { status: 'skipped' });
});

test('delivers automation payload without credentials and reports success', async () => {
  const validation = validateDemoRequest(baseRequest);
  assert.equal(validation.valid, true);
  if (!validation.valid) return;

  const payload = buildLeadAutomationPayload('lead-123', validation.value);
  let capturedBody = '';
  let capturedHeaders: HeadersInit | undefined;

  const result = await notifyLeadAutomation('https://automation.example.test/webhook/lch/demo-request', payload, {
    fetchImpl: async (_input, init) => {
      capturedBody = String(init?.body ?? '');
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ ok: true }), { status: 202 });
    },
  });

  assert.deepEqual(result, { status: 'sent', httpStatus: 202 });
  assert.equal(JSON.parse(capturedBody).leadId, 'lead-123');
  assert.equal(new Headers(capturedHeaders).get('x-lch-automation-schema'), 'lch.lead.v1');
});

test('does not throw when automation returns an error response', async () => {
  const validation = validateDemoRequest(baseRequest);
  assert.equal(validation.valid, true);
  if (!validation.valid) return;

  const payload = buildLeadAutomationPayload('lead-123', validation.value);
  const result = await notifyLeadAutomation('https://automation.example.test/webhook/lch/demo-request', payload, {
    fetchImpl: async () => new Response('unavailable', { status: 503 }),
  });

  assert.deepEqual(result, {
    status: 'failed',
    httpStatus: 503,
    error: 'automation_http_503',
  });
});

test('bounds automation delivery time and converts timeout into a failed result', async () => {
  const validation = validateDemoRequest(baseRequest);
  assert.equal(validation.valid, true);
  if (!validation.valid) return;

  const payload = buildLeadAutomationPayload('lead-123', validation.value);
  const result = await notifyLeadAutomation('https://automation.example.test/webhook/lch/demo-request', payload, {
    timeoutMs: 10,
    fetchImpl: async (_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }),
  });

  assert.equal(result.status, 'failed');
  assert.equal(result.error, 'AbortError');
});

test('rejects insecure non-local webhook URLs before network delivery', async () => {
  const validation = validateDemoRequest(baseRequest);
  assert.equal(validation.valid, true);
  if (!validation.valid) return;

  const payload = buildLeadAutomationPayload('lead-123', validation.value);
  const result = await notifyLeadAutomation('http://automation.example.test/webhook', payload);
  assert.deepEqual(result, { status: 'failed', error: 'unsupported_webhook_url' });
});
