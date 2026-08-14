import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { scoreLead, type NormalizedDemoRequest } from '../src/integrations/leadContract.ts';

const workflowUrl = new URL('../workflows/n8n/lch-firestore-lead-processor.json', import.meta.url);

async function loadWorkflow() {
  return JSON.parse(await readFile(workflowUrl, 'utf8'));
}

test('private Firestore processor is scheduled, inactive by default, and has no inbound trigger', async () => {
  const workflow = await loadWorkflow();
  assert.equal(workflow.name, 'LCH Website — Firestore Lead Processor');
  assert.equal(workflow.active, false);
  const schedule = workflow.nodes.find((node: { name: string }) => node.name === 'Every Minute');
  assert.equal(schedule.type, 'n8n-nodes-base.scheduleTrigger');
  assert.equal(schedule.parameters.rule.interval[0].field, 'minutes');
  assert.equal(schedule.parameters.rule.interval[0].minutesInterval, 1);
  assert.equal(workflow.nodes.some((node: { type: string }) => node.type === 'n8n-nodes-base.webhook'), false);
});

test('processor queries only pending demo requests and marks only automation fields', async () => {
  const workflow = await loadWorkflow();
  const query = workflow.nodes.find((node: { name: string }) => node.name === 'Query Pending Leads');
  const parsed = JSON.parse(query.parameters.query);
  assert.equal(parsed.structuredQuery.from[0].collectionId, 'demoRequests');
  assert.equal(parsed.structuredQuery.where.fieldFilter.field.fieldPath, 'automationStatus');
  assert.equal(parsed.structuredQuery.where.fieldFilter.value.stringValue, 'pending');
  assert.equal(parsed.structuredQuery.limit, 25);

  const upsert = workflow.nodes.find((node: { name: string }) => node.name === 'Mark Lead Processed');
  assert.equal(upsert.parameters.operation, 'upsert');
  assert.equal(upsert.parameters.updateKey, '_id');
  const columns = upsert.parameters.columns.split(',').map((value: string) => value.trim());
  assert.deepEqual(columns, [
    'automationStatus', 'automationPriority', 'automationScore', 'automationReasons',
    'automationQueue', 'automationSlaMinutes', 'automationProcessedAt',
  ]);
});

test('processor exports no credential, secret, or real project identifier', async () => {
  const raw = await readFile(workflowUrl, 'utf8');
  const workflow = JSON.parse(raw);
  assert.equal(workflow.nodes.some((node: { credentials?: unknown }) => node.credentials), false);
  assert.equal(raw.includes('credentials'), false);
  assert.equal(/AIza[0-9A-Za-z_-]+/.test(raw), false);
  assert.equal(/BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/.test(raw), false);
  assert.match(raw, /REPLACE_WITH_FIREBASE_PROJECT_ID/);
});

test('embedded private processor scorer stays in parity with canonical scoring', async () => {
  const workflow = await loadWorkflow();
  const codeNode = workflow.nodes.find((node: { name: string }) => node.name === 'Score Pending Leads');
  const run = new Function('$input', codeNode.parameters.jsCode) as (input: {
    all(): Array<{ json: Record<string, unknown> }>;
  }) => Array<{ json: Record<string, unknown> }>;

  const leads: NormalizedDemoRequest[] = [
    { nombre:'Ada', apellido:'Lovelace', email:'ada@examplecorp.com', empresa:'Example Corp', cargo:'Chief Technology Officer', interes:'Inteligencia Artificial', mensaje:'Queremos automatizar la revisión de contratos empresariales.', consentimiento:true },
    { nombre:'Ana', apellido:'Test', email:'ana@gmail.com', empresa:'X', cargo:'Analista', interes:'Cloud', mensaje:'', consentimiento:true },
  ];
  for (const [index, lead] of leads.entries()) {
    const actual = run({ all: () => [{ json: { _id:`lead-${index}`, ...lead, automationStatus:'pending' } }] })[0].json;
    const expected = scoreLead(lead);
    assert.equal(actual.automationStatus, 'processed');
    assert.equal(actual.automationPriority, expected.priority);
    assert.equal(actual.automationScore, expected.score);
    assert.deepEqual(actual.automationReasons, expected.reasons);
    assert.equal(actual._id, `lead-${index}`);
    assert.match(String(actual.automationProcessedAt), /^\d{4}-\d{2}-\d{2}T/);
  }
});
