import assert from 'node:assert/strict';
import test from 'node:test';
import { RECIPIENTS, SENDER, validateWebsiteLead, buildMessage } from '../src/mail.mjs';
import { getGraphAccessToken, sendGraphEmail, MailError } from '../src/graph.mjs';

const lead = (change = {}) => ({
  nombre: 'Ana', apellido: 'Pérez', email: 'ana@acme.example', empresa: 'Acme',
  cargo: 'Directora comercial', interes: 'Automatización', mensaje: 'Automatizar facturas',
  consentimiento: true, source: 'website', createdAt: '2026-10-10T15:05:00Z', ...change,
});
const REF = 'leadABC122223';

test('GH-25 four exact recipients and controlled sender', () => {
  assert.deepEqual(RECIPIENTS, [
    'contacto@lch-technologies.com',
    'eduardo.sacahui@lch-technologies.com',
    'lina.saldarriaga@lchtechnologies.onmicrosoft.com',
    'sara.saldarriaga@lchtechnologies.onmicrosoft.com',
  ]);
  assert.equal(SENDER, RECIPIENTS[0]);
  assert.equal(new Set(RECIPIENTS).size, 4);
});

test('GH-25 one branded message to four, reply-to is prospect, stable id header', () => {
  const message = buildMessage(REF, lead());
  assert.equal(message.message.toRecipients.length, 4);
  assert.equal(message.message.replyTo[0].emailAddress.address, 'ana@acme.example');
  assert.equal(message.message.internetMessageHeaders[0].value, REF);
  assert.equal(message.saveToSentItems, true);
  assert.match(message.message.subject, /Acme - Automatización/);
  assert.match(message.message.body.content, /Directora comercial/);
});

test('GH-25 escapes all HTML from visitor and rejects unconsented/new unauthorized source', () => {
  const message = buildMessage(REF, lead({ empresa: '<script>alert(1)</script>', mensaje: '<img src=x onerror=alert(1)>' }));
  assert.doesNotMatch(message.message.body.content, /<script>|<img/i);
  assert.match(message.message.body.content, /&lt;script&gt;/);
  assert.equal(validateWebsiteLead(lead({ consentimiento: false })), false);
  assert.equal(validateWebsiteLead(lead({ source: 'not-website' })), false);
  assert.equal(validateWebsiteLead(lead({ createdAt: null })), false);
  assert.equal(validateWebsiteLead(lead({ interes: 'Other' })), false);
  assert.throws(() => buildMessage(REF, lead({ consentimiento: false })), /lead_not_valid/);
  assert.throws(() => buildMessage('x', lead()), /lead_not_valid/);
});

test('GH-25 Graph application-only OAuth token scopes and Graph 202', async () => {
  const calls = [];
  const env = { M365_TENANT_ID: 'mock-tenant', M365_CLIENT_ID: 'mock-client', M365_CLIENT_SECRET: 'mock-secret' };
  const token = await getGraphAccessToken(env, async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => ({ access_token: 'fake-token' }) };
  });
  assert.equal(token, 'fake-token');
  assert.match(calls[0].url, /login\.microsoftonline\.com\/mock-tenant/);
  assert.match(calls[0].options.body, /scope=https%3A%2F%2Fgraph.microsoft.com%2F.default/);
  let sendUrl;
  const result = await sendGraphEmail(token, buildMessage(REF, lead()), async (url, options) => {
    sendUrl = url;
    assert.equal(options.headers.authorization, 'Bearer fake-token');
    assert.equal(JSON.parse(options.body).message.toRecipients.length, 4);
    return { status: 202 };
  });
  assert.equal(result.status, 'accepted');
  assert.equal(sendUrl, 'https://graph.microsoft.com/v1.0/users/contacto%40lch-technologies.com/sendMail');
});

test('GH-25 Graph 202 is required and OAuth failures distinguish permanent/transient', async () => {
  for (const [status, retryable] of [[400, false], [401, false], [403, false], [408, true], [429, true], [503, true]]) {
    await assert.rejects(
      () => sendGraphEmail('mock-token', buildMessage(REF, lead()), async () => ({ status })),
      (err) => err instanceof MailError && err.code === 'm365_mail_http_' + status && err.retryable === retryable,
    );
    await assert.rejects(
      () => getGraphAccessToken({ M365_TENANT_ID: 'mock', M365_CLIENT_ID: 'mock', M365_CLIENT_SECRET: 'fake' }, async () => ({ ok: false, status })),
      (err) => err instanceof MailError && err.code === 'm365_token_http_' + status && err.retryable === retryable,
    );
  }
});

test('GH-25 missing Graph credentials fail before any network request', async () => {
  await assert.rejects(() => getGraphAccessToken({ M365_TENANT_ID: 'fake', M365_CLIENT_ID: 'fake' }, () => { throw Error('should not fetch'); }),
    (err) => err instanceof MailError && err.code === 'm365_credentials_missing');
});
