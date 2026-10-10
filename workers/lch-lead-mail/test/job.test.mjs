import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_MAILS_PER_RUN, preflight, runNotificationScan } from '../src/job.mjs';
import { MailError } from '../src/graph.mjs';
import worker from '../src/index.mjs';

const NOW = Date.parse('2026-10-10T17:00:00Z');
const env = () => ({
  FIRESTORE_PROJECT_ID: 'rag-municipalidades',
  FIRESTORE_DATABASE_ID: 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7',
  GOOGLE_SERVICE_ACCOUNT_JSON: 'synthetic-service-account-not-a-key',
  M365_TENANT_ID: 'mock-tenant',
  M365_CLIENT_ID: 'mock-client',
  M365_CLIENT_SECRET: 'mock-secret',
  LCH_NOTIFY_FROM: '2026-10-10T16:00:00Z',
});
const lead = (changes = {}) => ({
  nombre: 'Ana', apellido: 'López', email: 'ana@acme.example', empresa: 'Acme',
  cargo: 'Directora', interes: 'Automatización', mensaje: 'Automatizar facturas',
  consentimiento: true, source: 'website', createdAt: '2026-10-10T16:15:00Z',
  automationStatus: 'pending', ...changes,
});
function fixture(leads) {
  let clock = 1;
  const rows = leads.map((fields, index) => ({
    id: `lead_${1000 + index}`,
    name: `https://firestore.googleapis.com/v1/projects/rag-municipalidades/databases/ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7/documents/demoRequests/lead_${1000 + index}`,
    updateTime: `v${clock++}`,
    fields: structuredClone(fields),
  }));
  const calls = { mails: 0, writes: 0, token: 0, read: 0, list: 0, conflicts: 0 };
  const api = {
    list: async ({ offset, limit }) => { calls.list++; return rows.slice(offset, offset + limit).map((x) => structuredClone(x)); },
    read: async ({ document }) => { calls.read++; return structuredClone(rows.find((x) => x.name === document)); },
    patch: async ({ document, updateTime, notification }) => {
      const row = rows.find((x) => x.name === document);
      if (!row) throw Error('unknown document');
      if (row.updateTime !== updateTime) {
        calls.conflicts++;
        const error = new Error('firestore_http_412'); error.status = 412;
        throw error;
      }
      calls.writes++;
      row.fields.notification = structuredClone(notification);
      row.updateTime = `v${clock++}`;
      return structuredClone(row);
    },
    googleToken: async () => { calls.token++; return 'mock-google'; },
    graphToken: async () => { calls.token++; return 'mock-graph'; },
    sendMail: async (_token, mail) => {
      calls.mails++;
      assert.equal(mail.message.toRecipients.length, 4);
      return { status: 'accepted' };
    },
  };
  return { rows, calls, api };
}

test('GH-25 fails closed when any secret missing, future launch, or wrong database', async () => {
  for (const key of ['GOOGLE_SERVICE_ACCOUNT_JSON', 'M365_TENANT_ID', 'M365_CLIENT_ID', 'M365_CLIENT_SECRET', 'LCH_NOTIFY_FROM']) {
    const e = env(); delete e[key];
    assert.equal(preflight(e, NOW).ready, false, key);
    assert.equal((await runNotificationScan(e, { now: NOW })).state, 'not_configured');
  }
  assert.equal(preflight({ ...env(), FIRESTORE_DATABASE_ID: '(default)' }, NOW).ready, false);
  assert.equal(preflight({ ...env(), LCH_NOTIFY_FROM: '2099-01-01T00:00:00Z' }, NOW).ready, false);
});

test('GH-25 one accepted email for lead, repeated scheduled execution skips it', async () => {
  const f = fixture([lead()]);
  const params = { now: NOW, ...f.api };
  const first = await runNotificationScan(env(), params);
  assert.equal(first.sent, 1);
  assert.equal(first.attempted, 1);
  assert.equal(f.rows[0].fields.notification.state, 'accepted');
  assert.equal(f.rows[0].fields.notification.provider, 'microsoft_graph');
  assert.equal(f.rows[0].fields.notification.attempts, 1);
  assert.equal(f.rows[0].fields.automationStatus, 'pending');
  const repeated = await runNotificationScan(env(), params);
  assert.equal(repeated.sent, 0);
  assert.equal(f.calls.mails, 1);
});

test('GH-25 without consent or from non-website never sends or claims', async () => {
  const f = fixture([
    lead({ consentimiento: false }), lead({ source: 'imported' }),
    lead({ email: 'not-mail' }), lead({ createdAt: '2026-10-10T15:00:00Z' }),
  ]);
  const result = await runNotificationScan(env(), { now: NOW, ...f.api });
  assert.equal(result.sent, 0);
  assert.equal(f.calls.mails, 0);
  assert.equal(f.calls.writes, 0);
});

test('GH-25 active lease prevents a concurrent duplicate email', async () => {
  const f = fixture([lead({ notification: { state: 'sending', attempts: 1, leaseUntilMs: NOW + 90_000 } })]);
  const result = await runNotificationScan(env(), { now: NOW, ...f.api });
  assert.equal(result.sent, 0);
  assert.equal(f.calls.mails, 0);
  assert.equal(f.calls.writes, 0);
});

test('GH-25 an expired lease can be reclaimed and increments attempts', async () => {
  const f = fixture([lead({ notification: { state: 'sending', attempts: 2, leaseUntilMs: NOW - 5_000 } })]);
  const result = await runNotificationScan(env(), { now: NOW, ...f.api });
  assert.equal(result.sent, 1);
  assert.equal(f.rows[0].fields.notification.attempts, 3);
});

test('GH-25 Firestore optimistic CAS conflicts never send email', async () => {
  const f = fixture([lead()]);
  f.api.patch = async () => {
    f.calls.conflicts++;
    const error = new Error('firestore_http_412'); error.status = 412;
    throw error;
  };
  const result = await runNotificationScan(env(), { now: NOW, ...f.api });
  assert.equal(result.conflict, 1);
  assert.equal(result.sent, 0);
  assert.equal(f.calls.mails, 0);
});

test('GH-25 transient Graph error preserves retry state; next scheduled run succeeds', async () => {
  const f = fixture([lead()]);
  let first = true;
  const sendMail = async () => {
    if (first) { first = false; throw new MailError('m365_mail_http_503', true); }
    return { status: 'accepted' };
  };
  await assert.rejects(() => runNotificationScan(env(), { now: NOW, ...f.api, sendMail }), /m365_mail_http_503/);
  assert.equal(f.rows[0].fields.notification.state, 'retry');
  assert.equal(f.rows[0].fields.notification.attempts, 1);
  const result = await runNotificationScan(env(), { now: NOW + 5 * 60_000, ...f.api, sendMail });
  assert.equal(result.sent, 1);
  assert.equal(f.rows[0].fields.notification.attempts, 2);
});

test('GH-25 permanent Graph 403 blocks lead without false delivered state', async () => {
  const f = fixture([lead()]);
  const result = await runNotificationScan(env(), {
    now: NOW, ...f.api,
    sendMail: async () => { throw new MailError('m365_mail_http_403', false, 403); },
  });
  assert.equal(result.sent, 0);
  assert.equal(result.blocked, 1);
  assert.equal(f.rows[0].fields.notification.state, 'blocked');
  assert.equal(f.rows[0].fields.notification.errorCode, 'm365_mail_http_403');
});

test('GH-25 seven attempts exhausts automated retries', async () => {
  const f = fixture([lead({ notification: { state: 'retry', attempts: 7 } })]);
  const result = await runNotificationScan(env(), { now: NOW, ...f.api });
  assert.equal(result.blocked, 1);
  assert.equal(result.sent, 0);
  assert.equal(f.rows[0].fields.notification.state, 'needs_review');
  assert.equal(f.calls.mails, 0);
});

test('GH-25 caps total attempts, not merely successful sends (Free tier subrequest budget)', async () => {
  const f = fixture(Array.from({ length: 23 }, () => lead()));
  const result = await runNotificationScan(env(), {
    now: NOW, ...f.api, sendMail: async () => { throw new MailError('m365_mail_http_403', false, 403); },
  });
  assert.equal(result.attempted, MAX_MAILS_PER_RUN);
  assert.equal(result.blocked, MAX_MAILS_PER_RUN);
  assert.equal(result.capped, true);
  assert.equal(f.calls.writes, MAX_MAILS_PER_RUN * 2);
});

test('GH-25 no public intake endpoint exists on Worker', async () => {
  const response = await worker.fetch(new Request('https://worker.invalid/anything'));
  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'Not Found');
});
