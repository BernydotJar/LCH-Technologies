import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildLeadAutomationPayload,
  scoreLead,
  validateDemoRequest,
  type DemoRequest,
  type LeadAutomationPayload,
} from '../src/integrations/leadContract.ts';

const workflowUrl = new URL('../workflows/n8n/lch-website-lead-intake.json', import.meta.url);

async function loadWorkflow() {
  return JSON.parse(await readFile(workflowUrl, 'utf8'));
}

async function executeValidationNode(envelope: unknown) {
  const workflow = await loadWorkflow();
  const codeNode = workflow.nodes.find((node: { name: string }) => node.name === 'Validate and Score');
  const run = new Function('$input', codeNode.parameters.jsCode) as (input: {
    first(): { json: unknown };
  }) => Array<{ json: Record<string, unknown> }>;

  return run({ first: () => ({ json: envelope }) })[0].json;
}

function makePayload(overrides: Partial<DemoRequest> = {}): LeadAutomationPayload {
  const request: DemoRequest = {
    nombre: 'Ada',
    apellido: 'Lovelace',
    email: 'ada@examplecorp.com',
    empresa: 'Example Corp',
    cargo: 'Chief Technology Officer',
    interes: 'Inteligencia Artificial',
    mensaje: 'Queremos automatizar la revisión y aprobación de contratos empresariales.',
    consentimiento: true,
    ...overrides,
  };
  const validation = validateDemoRequest(request);
  assert.equal(validation.valid, true);
  if (!validation.valid) throw new Error(validation.errors.join(', '));
  return buildLeadAutomationPayload('lead-parity-test', validation.value, '2026-08-12T20:00:00.000Z');
}

test('workflow exposes the stable LCH POST webhook and starts inactive', async () => {
  const workflow = await loadWorkflow();
  assert.equal(workflow.name, 'LCH Website — Lead Intake');
  assert.equal(workflow.active, false);

  const webhook = workflow.nodes.find((node: { name: string }) => node.name === 'Lead Webhook');
  assert.equal(webhook.type, 'n8n-nodes-base.webhook');
  assert.equal(webhook.parameters.httpMethod, 'POST');
  assert.equal(webhook.parameters.path, 'lch/demo-request');
  assert.equal(webhook.parameters.responseMode, 'responseNode');
});

test('workflow contains deterministic validation/scoring and explicit priority routing', async () => {
  const workflow = await loadWorkflow();
  const code = workflow.nodes.find((node: { name: string }) => node.name === 'Validate and Score');
  assert.match(code.parameters.jsCode, /corporate_email/);
  assert.match(code.parameters.jsCode, /decision_maker_role/);
  assert.match(code.parameters.jsCode, /priority = score >= 7 \? 'HOT'/);
  assert.match(code.parameters.jsCode, /receivedAt: new Date\(\)\.toISOString\(\)/);
  assert.match(code.parameters.jsCode, /clientSubmittedAt/);

  const router = workflow.nodes.find((node: { name: string }) => node.name === 'Priority Router');
  const outputs = router.parameters.rules.values.map((value: { outputKey: string }) => value.outputKey);
  assert.deepEqual(outputs, ['HOT', 'WARM', 'LOW', 'INVALID']);
});

test('embedded n8n scorer stays in parity with the canonical TypeScript scorer', async () => {
  const cases = [
    makePayload(),
    makePayload({
      email: 'person@gmail.com',
      cargo: 'Gerente de Operaciones',
      interes: 'Cloud',
      mensaje: '',
    }),
    makePayload({
      email: 'person@gmail.com',
      cargo: 'Analista',
      interes: 'Cloud',
      mensaje: '',
    }),
  ];

  for (const payload of cases) {
    const expected = scoreLead(payload.lead);
    const actual = await executeValidationNode({ body: payload });
    assert.equal(actual.ok, true);
    assert.equal(actual.priority, expected.priority);
    assert.equal(actual.score, expected.score);
    assert.deepEqual(actual.reasons, expected.reasons);
    assert.equal(actual.clientSubmittedAt, payload.submittedAt);
    assert.match(String(actual.receivedAt), /^\d{4}-\d{2}-\d{2}T/);
  }
});

test('embedded n8n validator rejects malformed envelopes', async () => {
  const payload = makePayload();
  const malformed = {
    ...payload,
    schemaVersion: 'wrong',
    lead: { ...payload.lead, consentimiento: false },
  };
  const actual = await executeValidationNode({ body: malformed });

  assert.equal(actual.ok, false);
  assert.equal(actual.route, 'INVALID');
  assert.deepEqual(actual.errors, ['schemaVersion', 'consentimiento']);
});

test('workflow exports no credentials or obvious secrets', async () => {
  const raw = await readFile(workflowUrl, 'utf8');
  const workflow = JSON.parse(raw);

  assert.equal(raw.includes('credentials'), false);
  assert.equal(/AIza[0-9A-Za-z_-]+/.test(raw), false);
  assert.equal(/BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/.test(raw), false);
  assert.equal(workflow.nodes.some((node: { credentials?: unknown }) => node.credentials), false);
});

test('workflow returns accepted and invalid responses with explicit status codes', async () => {
  const workflow = await loadWorkflow();
  const accepted = workflow.nodes.find((node: { name: string }) => node.name === 'Accepted');
  const invalid = workflow.nodes.find((node: { name: string }) => node.name === 'Invalid Request');

  assert.equal(accepted.parameters.options.responseCode, 202);
  assert.equal(invalid.parameters.options.responseCode, 400);
  assert.match(accepted.parameters.responseBody, /leadId/);
  assert.match(accepted.parameters.responseBody, /priority/);
  assert.match(invalid.parameters.responseBody, /errors/);
});
