import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEAD_NOTIFICATION_RECIPIENTS,
  LEAD_MAIL_SENDER,
  buildLeadEmail,
  validateLead,
} from '../src/notification.js';
import { GraphMailError, sendLeadMail } from '../src/graph.js';
import { processLeadNotification } from '../src/process.js';

const sampleLead = (extra = {}) => ({
  nombre: 'Ana', apellido: 'Lopez', email: 'ana@example.com',
  empresa: 'Empresa Uno', cargo: 'Gerente de operaciones',
  interes: 'Automatización', mensaje: 'Necesito reducir tiempos de facturacion',
  consentimiento: true, source: 'website', status: 'new',
  automationStatus: 'pending',
  ...extra,
});
const leadId = 'lead_ABC123456';

function fakeDatabase(data = sampleLead()) {
  const state = { ...data };
  return {
    state,
    collection(name) {
      assert.equal(name, 'demoRequests');
      return { doc(id) { assert.equal(id, leadId); return { id }; } };
    },
    async runTransaction(handler) {
      const writes = [];
      const tx = {
        async get(ref) {
          return { exists: true, data: () => ({ ...state, notification: state.notification ? { ...state.notification } : undefined }) };
        },
        update(_ref, changes) { writes.push(changes); },
      };
      const result = await handler(tx);
      writes.forEach((changes) => Object.assign(state, changes));
      return result;
    },
  };
}

const config = { tenantId: 'tenant-id', clientId: 'client-id', clientSecret: 'mock-secret' };

test('GH-25 exact four approved recipients (no unapproved additions)', () => {
  assert.deepEqual(LEAD_NOTIFICATION_RECIPIENTS, [
    'contacto@lch-technologies.com',
    'eduardo.sacahui@lch-technologies.com',
    'lina.saldarriaga@lchtechnologies.onmicrosoft.com',
    'sara.saldarriaga@lchtechnologies.onmicrosoft.com',
  ]);
  assert.equal(new Set(LEAD_NOTIFICATION_RECIPIENTS).size, 4);
  assert.equal(LEAD_MAIL_SENDER, 'contacto@lch-technologies.com');
});

test('GH-25 one branded email addresses all four and replies to the prospect', () => {
  const { message, saveToSentItems } = buildLeadEmail(leadId, sampleLead());
  assert.equal(message.toRecipients.length, 4);
  assert.equal(message.replyTo[0].emailAddress.address, 'ana@example.com');
  assert.equal(message.subject, '[LCH] Nuevo contacto: Empresa Uno - Automatización');
  assert.match(message.body.content, /Gerente de operaciones/);
  assert.match(message.body.content, /Necesito reducir tiempos de facturacion/);
  assert.match(message.body.content, /lead_ABC123456/);
  assert.equal(message.internetMessageHeaders[0].value, leadId);
  assert.equal(saveToSentItems, true);
});

test('GH-25 malicious lead content is escaped and cannot add addresses', () => {
  const mail = buildLeadEmail(leadId, sampleLead({
    empresa: '<img src=x onerror=alert(1)>',
    mensaje: '<script>alert("hack")</script>\nContacte conmigo',
  }));
  assert.doesNotMatch(mail.message.body.content, /<script>|<img\s/i);
  assert.match(mail.message.body.content, /&lt;script&gt;/);
  assert.equal(mail.message.toRecipients.length, 4);
  assert.ok(mail.message.subject.length < 180);
});

test('GH-25 unconsented and incomplete contacts cannot be emailed', () => {
  assert.equal(validateLead(sampleLead({ consentimiento: false })), false);
  assert.equal(validateLead(sampleLead({ source: 'browser-untrusted' })), false);
  assert.equal(validateLead(sampleLead({ email: 'bad-email' })), false);
  assert.throws(() => buildLeadEmail(leadId, sampleLead({ consentimiento: false })));
  assert.throws(() => buildLeadEmail('oops', sampleLead()));
});

test('GH-25 Graph client uses application token + Graph sendMail, accepted is only 202', async () => {
  const calls = [];
  const result = await sendLeadMail({ ...config, sender: LEAD_MAIL_SENDER,
    mail: buildLeadEmail(leadId, sampleLead()),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return calls.length === 1
        ? { ok: true, status: 200, json: async () => ({ access_token: 'test-access-token' }) }
        : { ok: true, status: 202 };
    },
  });
  assert.deepEqual(result, { status: 'accepted', graphStatus: 202 });
  assert.match(calls[0].url, /login\.microsoftonline\.com\/tenant-id\/oauth2\/v2\.0\/token/);
  assert.match(calls[0].options.body, /grant_type=client_credentials/);
  assert.match(calls[0].options.body, /graph.microsoft.com%2F.default/);
  assert.equal(calls[1].url, 'https://graph.microsoft.com/v1.0/users/contacto%40lch-technologies.com/sendMail');
  assert.equal(calls[1].options.headers.Authorization, 'Bearer test-access-token');
  assert.equal(JSON.parse(calls[1].options.body).message.toRecipients.length, 4);
});

test('GH-25 Graph 403 is configuration-blocked, Graph 429/503 retry', async () => {
  for (const [code, retryable] of [[403, false], [400, false], [429, true], [503, true]]) {
    let count = 0;
    await assert.rejects(() => sendLeadMail({ ...config, sender: LEAD_MAIL_SENDER,
      mail: buildLeadEmail(leadId, sampleLead()),
      fetchImpl: async () => ++count === 1
        ? { ok: true, status: 200, json: async () => ({ access_token: 'mock' }) }
        : { ok: false, status: code },
    }), (error) => {
      assert.equal(error instanceof GraphMailError, true);
      assert.equal(error.retryable, retryable);
      assert.equal(error.code, `graph_mail_http_${code}`);
      return true;
    });
  }
});

test('GH-25 Graph auth without credentials fails closed before network', async () => {
  await assert.rejects(() => sendLeadMail({ ...config, clientSecret: '', sender: LEAD_MAIL_SENDER,
    mail: buildLeadEmail(leadId, sampleLead()),
    fetchImpl: () => { throw Error('fetch should never run'); },
  }), (error) => error instanceof GraphMailError && error.code === 'missing_microsoft_configuration');
});

test('GH-25 Firestore process stores accepted status after one send, duplicate no-op', async () => {
  const db = fakeDatabase();
  const mails = [];
  const options = { db, leadId, credentials: config, now: () => 1000,
    mailer: async (request) => { mails.push(request); return { status: 'accepted' }; },
  };
  const first = await processLeadNotification(options);
  assert.deepEqual(first, { status: 'accepted', recipients: 4 });
  assert.equal(db.state.notification.state, 'accepted');
  assert.equal(db.state.notification.attempts, 1);
  assert.equal(db.state.automationStatus, 'pending');
  const second = await processLeadNotification(options);
  assert.equal(second.reason, 'accepted');
  assert.equal(mails.length, 1);
});

test('GH-25 Firestore excludes invalid lead before contacting Microsoft', async () => {
  const db = fakeDatabase(sampleLead({ consentimiento: false }));
  const result = await processLeadNotification({ db, leadId, credentials: config, now: () => 1000,
    mailer: () => { throw Error('should not run'); },
  });
  assert.equal(result.reason, 'invalid');
  assert.equal(db.state.notification.state, 'invalid');
});

test('GH-25 Firestore duplicate during active lease requests retry rather than duplicate send', async () => {
  const db = fakeDatabase(sampleLead({ notification: {
    provider: 'microsoft_graph', state: 'sending', attempts: 1, leaseUntilMs: 120000,
  } }));
  await assert.rejects(() => processLeadNotification({ db, leadId, credentials: config, now: () => 1000,
    mailer: () => { throw Error('no mail'); },
  }), (error) => error.code === 'notification_lease_active' && error.retryable);
});

test('GH-25 transient Graph failure records retry without falsely marking sent', async () => {
  const db = fakeDatabase();
  await assert.rejects(() => processLeadNotification({ db, leadId, credentials: config, now: () => 1000,
    mailer: async () => { throw new GraphMailError('graph_mail_http_503', true, 503); },
  }), /graph_mail_http_503/);
  assert.equal(db.state.notification.state, 'retry');
  assert.equal(db.state.notification.attempts, 1);
  assert.equal(db.state.notification.errorCode, 'graph_mail_http_503');
});

test('GH-25 permanent Microsoft authorization failure is surfaced for admin attention', async () => {
  const db = fakeDatabase();
  const result = await processLeadNotification({ db, leadId, credentials: config, now: () => 1000,
    mailer: async () => { throw new GraphMailError('graph_mail_http_403', false, 403); },
  });
  assert.equal(result.status, 'blocked');
  assert.equal(db.state.notification.state, 'blocked');
  assert.equal(db.state.notification.errorCode, 'graph_mail_http_403');
});

test('GH-25 max retry threshold requires human review', async () => {
  const db = fakeDatabase(sampleLead({ notification: { state: 'retry', attempts: 7 } }));
  const result = await processLeadNotification({ db, leadId, credentials: config, now: () => 1000,
    mailer: async () => { throw Error('should not run'); },
  });
  assert.equal(result.reason, 'needs_review');
  assert.equal(db.state.notification.state, 'needs_review');
});

test('GH-25 deployment wiring targets the exact existing named database and region', async () => {
  const { lchLeadMailNotification } = await import('../index.js');
  const endpoint = lchLeadMailNotification.__endpoint;
  assert.equal(endpoint.eventTrigger.eventType, 'google.cloud.firestore.document.v1.created');
  assert.equal(endpoint.eventTrigger.eventFilters.database, 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7');
  assert.deepEqual(endpoint.region, ['us-west1']);
  assert.equal(endpoint.eventTrigger.retry, true);
  assert.ok(endpoint.secretEnvironmentVariables.length >= 3);
});
