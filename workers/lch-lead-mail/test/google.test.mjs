import assert from 'node:assert/strict';
import test from 'node:test';
import { generateKeyPairSync, createPrivateKey } from 'node:crypto';
import { mintGoogleAccessToken, parseServiceAccount } from '../src/google.mjs';

const rsa = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
const account = {
  type: 'service_account', project_id: 'rag-municipalidades',
  client_email: 'lch-notifications@rag-municipalidades.iam.gserviceaccount.com',
  token_uri: 'https://oauth2.googleapis.com/token', private_key: rsa.privateKey,
};

test('GH-25 service account refuses wrong project, wrong token host and invalid key', () => {
  assert.deepEqual(parseServiceAccount(JSON.stringify(account), 'rag-municipalidades'), account);
  assert.throws(() => parseServiceAccount(JSON.stringify(account), 'other-project'));
  assert.throws(() => parseServiceAccount(JSON.stringify({ ...account, token_uri: 'https://attacker.invalid' }), 'rag-municipalidades'));
  assert.throws(() => parseServiceAccount('{', 'rag-municipalidades'));
});

test('GH-25 WebCrypto RS256 Google JWT is signed, datastore-scoped and short lived', async () => {
  let requests = 0;
  const token = await mintGoogleAccessToken({
    serviceAccountJson: JSON.stringify(account), projectId: 'rag-municipalidades',
    now: Date.parse('2026-10-10T19:00:00Z'),
    fetchImpl: async (url, opts) => {
      requests++;
      assert.equal(url, 'https://oauth2.googleapis.com/token');
      const fields = new URLSearchParams(opts.body);
      assert.equal(fields.get('grant_type'), 'urn:ietf:params:oauth:grant-type:jwt-bearer');
      const parts = fields.get('assertion').split('.');
      assert.equal(parts.length, 3);
      const decode = (x) => Buffer.from(x, 'base64url');
      const payload = JSON.parse(decode(parts[1]).toString('utf8'));
      assert.equal(payload.scope, 'https://www.googleapis.com/auth/datastore');
      assert.equal(payload.aud, url);
      assert.equal(payload.iss, account.client_email);
      assert.equal(payload.exp - payload.iat, 3515);
      const { createVerify } = await import('node:crypto');
      const verify = createVerify('RSA-SHA256');
      verify.update(`${parts[0]}.${parts[1]}`);
      assert.equal(verify.verify(rsa.publicKey, decode(parts[2])), true);
      return { ok: true, status: 200, json: async () => ({ access_token: 'mock-google-token' }) };
    },
  });
  assert.equal(requests, 1);
  assert.equal(token, 'mock-google-token');
});
