import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const path = fileURLToPath(new URL('../workflows/n8n/lch-contact-mail-spark.workflow.json', import.meta.url));
const workflow = JSON.parse(fs.readFileSync(path, 'utf8'));
const node = (name: string) => {
  const found = workflow.nodes.find((entry: { name: string }) => entry.name === name);
  assert.ok(found, 'missing workflow node ' + name);
  return found;
};
const runCode = (name: string, context: Record<string, unknown> = {}) => {
  const source = node(name).parameters.jsCode;
  return vm.runInNewContext('(function() { ' + source + '\n })()', { Date, Math, String, Number, Object, Array, Set, ...context }, { timeout: 800 });
};

const lead = (extras: Record<string, unknown> = {}) => ({
  nombre: 'Ana', apellido: 'Perez', email: 'ana@empresa.example', empresa: 'Acme',
  cargo: 'Gerente', interes: 'Automatización', mensaje: 'Automatizar facturación',
  consentimiento: true, source: 'website', createdAt: '2026-10-10T10:10:00Z',
  ...extras,
});
function encoded(value: unknown): Record<string, unknown> {
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (typeof value === 'string') return { stringValue: value };
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'object') return {
    mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encoded(v)])) },
  };
  throw new Error('unexpected field');
}
const document = (data = lead(), index = 0) => ({
  json: {
    document: {
      name: 'projects/rag-municipalidades/databases/ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7/documents/demoRequests/lead_' + (12345 + index),
      updateTime: '2026-10-10T10:12:00.123Z',
      fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, k === 'createdAt' ? { timestampValue: v } : encoded(v)])),
    },
  },
});
const prepare = (items: Array<Record<string, unknown>>) =>
  runCode('Prepare eligible leads', {
    $input: { all: () => items },
    $execution: { id: 'synthetic-run-123' },
    $: (_name: string) => ({ first: () => ({ json: { activationUtc: '2026-10-09T00:00:00Z' } }) }),
  });

test('GH-26: separate n8n workflow imported inactive with unique nodes and one linear path', () => {
  assert.equal(workflow.active, false);
  assert.equal(workflow.settings.saveDataSuccessExecution, 'none');
  assert.equal(workflow.settings.saveDataErrorExecution, 'none');
  assert.equal(workflow.settings.saveManualExecutions, false);
  assert.equal(workflow.settings.saveExecutionProgress, false);
  assert.equal(workflow.id, 'lchContactNotifyN8nGH26');
  assert.equal(workflow.nodes.length, 13);
  assert.equal(new Set(workflow.nodes.map((n: { id: string }) => n.id)).size, 13);
  assert.equal(new Set(workflow.nodes.map((n: { name: string }) => n.name)).size, 13);
  const names = workflow.nodes.map((n: { name: string }) => n.name);
  const primary = names.filter((name: string) => !['Select Retry-Exhausted Leads', 'Record Needs Review'].includes(name));
  for (let i = 0; i < primary.length - 1; i++) {
    assert.equal(workflow.connections[primary[i]].main[0][0].node, primary[i + 1]);
  }
  assert.equal(workflow.connections['Read Consented Contacts'].main[0][1].node, 'Select Retry-Exhausted Leads');
  assert.equal(workflow.connections['Select Retry-Exhausted Leads'].main[0][0].node, 'Record Needs Review');
  assert.equal(workflow.connections['Record Needs Review'], undefined);
  assert.equal(workflow.connections[primary.at(-1)], undefined);
  assert.match(workflow.name, /LCH/);
  assert.doesNotMatch(JSON.stringify(workflow), /lina-agenda-v1|resend\.com|whatsapp/i);
});

test('GH-26: safe five-minute trigger, correct named Firestore database and prepared timestamp query', () => {
  assert.deepEqual(workflow.nodes[0].parameters.rule.interval, [{ field: 'minutes', minutesInterval: 5 }]);
  const query = node('Read Consented Contacts').parameters;
  assert.equal(query.resource, 'document');
  assert.equal(query.operation, 'query');
  assert.equal(query.simple, false);
  assert.equal(query.authentication, 'serviceAccount');
  assert.equal(query.projectId, 'rag-municipalidades');
  assert.equal(query.database, 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7');
  assert.match(query.query, /createdAt/);
  assert.match(query.query, /timestampValue:\$json\.activationUtc/);
  assert.match(query.query, /limit:40/);
});

test('GH-26: activation is strictly fail closed until configured and rejects retroactive dates', () => {
  assert.equal(runCode('Activation UTC').length, 0);
  const source = node('Activation UTC').parameters.jsCode;
  assert.match(source, /__REPLACE_WITH_ACTIVATION_UTC__/);
  const preparedSource = source.replace('__REPLACE_WITH_ACTIVATION_UTC__', '2026-10-09T00:00:00Z');
  const result = vm.runInNewContext('(function(){' + preparedSource + '\n})()', { Date }, { timeout: 800 });
  assert.equal(result.length, 1);
  assert.equal(result[0].json.activationUtc, '2026-10-09T00:00:00Z');
});

test('GH-26: eligible lead yields one private Outlook message to precisely four recipients', () => {
  const result = prepare([document()]);
  assert.equal(result.length, 1);
  const message = result[0].json;
  assert.equal(message.leadId, 'lead_12345');
  assert.deepEqual(message.recipients.split(','), [
    'contacto@lch-technologies.com',
    'eduardo.sacahui@lch-technologies.com',
    'lina.saldarriaga@lchtechnologies.onmicrosoft.com',
    'sara.saldarriaga@lchtechnologies.onmicrosoft.com',
  ]);
  assert.equal(message.replyTo, 'ana@empresa.example');
  assert.match(message.subject, /Acme - Automatización/);
  assert.equal(message.claimBody.fields.notification.mapValue.fields.state.stringValue, 'sending');
  assert.equal(message.claimBody.fields.notification.mapValue.fields.attempts.integerValue, '1');
  assert.equal(message.claimBody.name, message.documentName);
  assert.equal(result[0].pairedItem.item, 0);
});

test('GH-26: no consent, nonwebsite, old leads, accepted lead, active lease, and exhausted retries are omitted', () => {
  const now = Date.now();
  const items = [
    document(lead({ consentimiento: false }), 0),
    document(lead({ source: 'import' }), 1),
    document(lead({ createdAt: '2026-10-08T00:00:00Z' }), 2),
    document(lead({ notification: { state: 'accepted' } }), 3),
    document(lead({ notification: { state: 'sending', leaseUntilMs: now + 60000 } }), 4),
    document(lead({ notification: { state: 'retry', attempts: 7 } }), 5),
    document(lead({ email: 'not an email' }), 6),
  ];
  assert.equal(prepare(items).length, 0);
});

test('GH-26: PII is escaped; recipient addresses are not copied from untrusted Firestore input', () => {
  const result = prepare([document(lead({
    empresa: '<img src=x onerror=alert(1)>',
    mensaje: '<script>alert(1)</script>',
    recipientOverride: 'attacker@example.com',
  }))]);
  assert.equal(result.length, 1);
  const message = result[0].json;
  assert.match(message.html, /&lt;script&gt;/);
  assert.doesNotMatch(message.html, /<img|<script>/);
  assert.doesNotMatch(message.recipients, /attacker/);
  assert.equal(message.recipients.split(',').length, 4);
});

test('GH-26: Firestore claim and ACK are guarded by optimistic updateTime and only notification field', () => {
  const a = node('Claim Firestore Lease').parameters;
  const b = node('Record Outlook Acceptance').parameters;
  for (const parameters of [a, b]) {
    assert.equal(parameters.authentication, 'predefinedCredentialType');
    assert.equal(parameters.nodeCredentialType, 'googleApi');
    assert.equal(parameters.method, 'PATCH');
    assert.match(parameters.url, /https:\/\/firestore\.googleapis\.com\/v1\//);
    assert.match(parameters.url, /updateMask\.fieldPaths=notification/);
    assert.match(parameters.url, /currentDocument\.updateTime=/);
    assert.equal(parameters.sendBody, true);
    assert.equal(parameters.specifyBody, 'json');
  }
  assert.equal(node('Re-read Firestore Lease').parameters.method, 'GET');
  assert.match(node('Re-read Firestore Lease').parameters.url, /https:\/\/firestore\.googleapis\.com\/v1\//);
  assert.equal(node('Re-read Firestore Lease').parameters.nodeCredentialType, 'googleApi');
});

test('GH-26: Outlook uses credential-backed native node with immutable sender and contact Reply-To', () => {
  const data = node('Outlook Send Four Recipients').parameters;
  assert.equal(node('Outlook Send Four Recipients').type, 'n8n-nodes-base.microsoftOutlook');
  assert.equal(data.authentication, 'microsoftOutlookOAuth2Api');
  assert.equal(data.resource, 'message');
  assert.equal(data.operation, 'send');
  assert.equal(data.additionalFields.from, 'contacto@lch-technologies.com');
  assert.equal(data.additionalFields.bodyContentType, 'html');
  assert.equal(data.additionalFields.saveToSentItems, true);
  assert.match(data.toRecipients, /Prepare eligible leads/);
  assert.match(data.additionalFields.replyTo, /Prepare eligible leads/);
  assert.equal(data.additionalFields.internetMessageHeaders.headers[0].name, 'x-lch-lead-id');
  assert.equal(workflow.nodes.some((n: { type: string }) => /webhook|emailSend/i.test(n.type)), false);
  assert.equal(workflow.nodes.some((n: { credentials?: unknown }) => n.credentials !== undefined), false);
});

test('GH-26: ACK Code requires the same lease before marking accepted', () => {
  const prepared = prepare([document()]);
  const lease = prepared[0].json.leaseId;
  const claimedDoc = document().json.document;
  const leaseDoc = { json: { ...claimedDoc, fields: {
    ...claimedDoc.fields,
    notification: { mapValue: { fields: { state: { stringValue: 'sending' }, leaseId: { stringValue: lease } } } },
  } } };
  const runAck = (value: Record<string, unknown>) =>
    runCode('Verify Original Lease', {
      $input: { all: () => [value] },
      $: (_name: string) => ({ itemMatching: (_index: number) => ({ json: prepared[0].json }) }),
    });
  const result = runAck(leaseDoc);
  assert.equal(result.length, 1);
  assert.equal(result[0].json.ackBody.fields.notification.mapValue.fields.state.stringValue, 'accepted');
  assert.equal(result[0].json.documentName, claimedDoc.name);
  const mismatch = structuredClone(leaseDoc);
  mismatch.json.fields.notification.mapValue.fields.leaseId.stringValue = 'another-lease';
  assert.equal(runAck(mismatch).length, 0);
});

test('GH-28: Firestore claim conflicts are contained before Outlook without faking sends', () => {
  assert.equal(node('Claim Firestore Lease').continueOnFail, true);
  const src = prepare([document()])[0].json;
  const claimed = { json: {
    name: src.documentName, updateTime: '2026-10-10T10:12:01Z', fields: {
      notification: { mapValue: { fields: {
        state: { stringValue: 'sending' }, leaseId: { stringValue: src.leaseId },
      } } },
    },
  } };
  const run = (value: Record<string, unknown>) => runCode('Confirm Firestore Lease', {
    $input: { all: () => [value] },
    $: (_name: string) => ({ itemMatching: (_index: number) => ({ json: src }) }),
  });
  assert.equal(run(claimed).length, 1);
  assert.equal(run(claimed)[0].json.claimConfirmed, true);
  assert.equal(run({ json: { error: 'firestore_http_400' } }).length, 0);
  const wrongLease = structuredClone(claimed);
  wrongLease.json.fields.notification.mapValue.fields.leaseId.stringValue = 'other-writer';
  assert.equal(run(wrongLease).length, 0);
  const wrongDocument = structuredClone(claimed);
  wrongDocument.json.name = 'projects/other/documents/elsewhere';
  assert.equal(run(wrongDocument).length, 0);
});

test('GH-28: Graph/Outlook failure cannot set Firestore accepted state', () => {
  assert.equal(node('Outlook Send Four Recipients').continueOnFail, true);
  const src = prepare([document()])[0].json;
  const run = (value: Record<string, unknown>) => runCode('Confirm Outlook Accepted', {
    $input: { all: () => [{ json: value }] },
    $: (_name: string) => ({ itemMatching: (_index: number) => ({ json: src }) }),
  });
  const good = run({ success: true });
  assert.equal(good.length, 1);
  assert.equal(good[0].json.providerAccepted, true);
  assert.equal(good[0].json.leadId, src.leadId);
  for (const bad of [{ error: '403 Forbidden' }, { success: false }, { success: 'true' }, {}, { accepted: true }]) {
    assert.equal(run(bad).length, 0);
  }
});

test('GH-28: n8n sends only after successful Firestore claim and records only after confirmed provider acceptance', () => {
  const names = workflow.nodes.map((n: {name: string}) => n.name);
  const from = (name: string) => names.indexOf(name);
  const claim = from('Claim Firestore Lease');
  const verifiedClaim = from('Confirm Firestore Lease');
  const outlook = from('Outlook Send Four Recipients');
  const verifiedOutlook = from('Confirm Outlook Accepted');
  const reRead = from('Re-read Firestore Lease');
  const finalWrite = from('Record Outlook Acceptance');
  assert.ok(claim < verifiedClaim && verifiedClaim < outlook && outlook < verifiedOutlook && verifiedOutlook < reRead && reRead < finalWrite);
  assert.equal(node('Confirm Firestore Lease').type, 'n8n-nodes-base.code');
  assert.equal(node('Confirm Outlook Accepted').type, 'n8n-nodes-base.code');
  assert.equal(workflow.active, false);
});

test('GH-28: retry-exhausted lead is durably routed to needs_review without Outlook', () => {
  const cutoff = '2026-10-09T00:00:00Z';
  const run = (items: Array<Record<string, unknown>>) => runCode('Select Retry-Exhausted Leads', {
    $input: { all: () => items },
    $: (_name: string) => ({ first: () => ({ json: { activationUtc: cutoff } }) }),
  });
  const item = document(lead({ notification: { state: 'retry', attempts: 7 } }));
  const result = run([item]);
  assert.equal(result.length, 1);
  const record = result[0].json;
  assert.equal(record.reviewBody.fields.notification.mapValue.fields.state.stringValue, 'needs_review');
  assert.equal(record.reviewBody.fields.notification.mapValue.fields.errorCode.stringValue, 'retry_limit');
  assert.equal(record.reviewBody.fields.notification.mapValue.fields.attempts.integerValue, '7');
  assert.equal(record.reviewBody.name, item.json.document.name);
  assert.deepEqual(Object.keys(record.reviewBody.fields), ['notification']);
  assert.equal(result[0].pairedItem.item, 0);
  assert.equal(Reflect.has(record, 'recipients'), false);
  assert.equal(Reflect.has(record, 'html'), false);
  const patch = node('Record Needs Review');
  assert.equal(patch.continueOnFail, true);
  assert.equal(patch.parameters.method, 'PATCH');
  assert.equal(patch.parameters.nodeCredentialType, 'googleApi');
  assert.match(patch.parameters.url, /currentDocument\.updateTime/);
  assert.match(patch.parameters.url, /https:\/\/firestore\.googleapis\.com\/v1/);
  assert.match(patch.parameters.jsonBody, /reviewBody/);
});

test('GH-28: only valid consented and expired leases reach retry-exhausted review branch', () => {
  const items = [
    document(lead({ consentimiento: false, notification: { state: 'retry', attempts: 7 } }), 0),
    document(lead({ source: 'import', notification: { state: 'retry', attempts: 7 } }), 1),
    document(lead({ notification: { state: 'accepted', attempts: 9 } }), 2),
    document(lead({ notification: { state: 'sending', leaseUntilMs: Date.now() + 120000, attempts: 7 } }), 3),
    document(lead({ notification: { state: 'retry', attempts: 6 } }), 4),
    document(lead({ createdAt: '2026-10-07T00:00:00Z', notification: { state: 'retry', attempts: 9 } }), 5),
    document(lead({ notification: { state: 'sending', leaseUntilMs: Date.now() - 1000, attempts: 7 } }), 6),
  ];
  const result = runCode('Select Retry-Exhausted Leads', {
    $input: { all: () => items },
    $: (_name: string) => ({ first: () => ({ json: { activationUtc: '2026-10-09T00:00:00Z' } }) }),
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].json.reviewBody.fields.notification.mapValue.fields.state.stringValue, 'needs_review');
  assert.equal(result[0].pairedItem.item, 6);
});
