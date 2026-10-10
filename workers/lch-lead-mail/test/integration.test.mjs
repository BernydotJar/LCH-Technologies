import assert from 'node:assert/strict';
import test from 'node:test';
import { runNotificationScan } from '../src/job.mjs';
import { sendGraphEmail } from '../src/graph.mjs';

const DB = 'https://firestore.googleapis.com/v1/projects/rag-municipalidades/databases/ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7/documents';
const REF = DB + '/demoRequests/live_style_simulation_400';
const START = '2026-10-10T18:00:00Z';
function field(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Number.isSafeInteger(value)) return { integerValue: String(value) };
  if (typeof value === 'string') return { stringValue: value };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, field(v)])) } };
}
const initialFields = {
  nombre: 'Ana', apellido: 'Lopez', email: 'ana@example.com', empresa: 'Acme',
  cargo: 'Directora', interes: 'Automatización', mensaje: 'Optimizar facturación',
  consentimiento: true, source: 'website',
  createdAt: '2026-10-10T18:01:00Z', automationStatus: 'processed',
};

function simulatedTransport() {
  let revision = 1;
  const state = structuredClone(initialFields);
  const requests = [];
  let mailPosts = 0;
  const asWire = () => ({
    name: REF,
    updateTime: `2026-10-10T18:01:0${revision}Z`,
    fields: Object.fromEntries(Object.entries(state).map(([k, v]) => [k, k === 'createdAt' ? { timestampValue: v } : field(v)])),
  });
  const transport = async (url, options = {}) => {
    const path = String(url);
    requests.push({ method: options.method || 'GET', endpoint: path.split('?')[0] });
    if (path === DB + ':runQuery') {
      const query = JSON.parse(options.body).structuredQuery;
      assert.equal(query.where.fieldFilter.op, 'GREATER_THAN_OR_EQUAL');
      assert.equal(query.where.fieldFilter.value.timestampValue, new Date(START).toISOString());
      return { ok: true, status: 200, json: async () => [{ document: asWire() }] };
    }
    if (path.startsWith(REF + '?')) {
      const params = new URL(path).searchParams;
      assert.equal(params.get('updateMask.fieldPaths'), 'notification');
      if (params.get('currentDocument.updateTime') !== asWire().updateTime) {
        return { ok: false, status: 400, json: async () => ({ error: { status: 'FAILED_PRECONDITION' } }) };
      }
      const patch = JSON.parse(options.body);
      assert.deepEqual(Object.keys(patch.fields), ['notification']);
      const decode = (value) => value.stringValue ?? value.booleanValue ?? (value.integerValue ? Number(value.integerValue) : (value.mapValue ? Object.fromEntries(Object.entries(value.mapValue.fields).map(([k, v]) => [k, decode(v)])) : null));
      state.notification = decode(patch.fields.notification);
      revision++;
      return { ok: true, status: 200, json: async () => asWire() };
    }
    if (path === REF) return { ok: true, status: 200, json: async () => asWire() };
    if (path === 'https://graph.microsoft.com/v1.0/users/contacto%40lch-technologies.com/sendMail') {
      mailPosts++;
      const message = JSON.parse(options.body);
      assert.equal(message.message.toRecipients.length, 4);
      assert.equal(message.message.replyTo[0].emailAddress.address, 'ana@example.com');
      assert.equal(options.headers.authorization, 'Bearer mock-graph-token');
      return { status: 202 };
    }
    throw new Error('Unexpected outbound URL in mock: ' + path);
  };
  return { state, requests, transport, get mailPosts() { return mailPosts; } };
}

test('GH-25 full simulated Wire Worker -> Firestore CAS -> Microsoft Graph 202 -> Firestore ack; second cron is idempotent', async () => {
  const mock = simulatedTransport();
  const env = {
    FIRESTORE_PROJECT_ID: 'rag-municipalidades',
    FIRESTORE_DATABASE_ID: 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7',
    GOOGLE_SERVICE_ACCOUNT_JSON: 'synthetic-no-key',
    M365_TENANT_ID: 'mock-tenant', M365_CLIENT_ID: 'mock-id', M365_CLIENT_SECRET: 'mock-secret',
    LCH_NOTIFY_FROM: START,
  };
  const options = {
    now: Date.parse('2026-10-10T18:05:00Z'),
    fetchImpl: mock.transport,
    googleToken: async () => 'mock-google-token',
    graphToken: async () => 'mock-graph-token',
    sendMail: sendGraphEmail,
  };
  const first = await runNotificationScan(env, options);
  assert.equal(first.sent, 1);
  assert.equal(mock.mailPosts, 1);
  assert.equal(mock.state.notification.state, 'accepted');
  assert.equal(mock.state.automationStatus, 'processed');
  assert.ok(mock.requests.some((x) => x.method === 'PATCH'));
  const second = await runNotificationScan(env, options);
  assert.equal(second.sent, 0);
  assert.equal(mock.mailPosts, 1);
});
