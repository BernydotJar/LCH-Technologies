import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { createSiteHandler, DonnaRateLimiter } from '../server/handler.ts';

type TestServer = { url: string; server: Server; dist: string; close(): Promise<void> };

async function start(limiter?: DonnaRateLimiter): Promise<TestServer> {
  const dist = await mkdtemp(join(tmpdir(), 'donna-lch-http-'));
  await writeFile(join(dist, 'index.html'), '<!doctype html><title>LCH Donna Test</title><h1>Healthy</h1>');
  const handler = createSiteHandler({
    distDir: dist,
    releaseSha: 'test-commit',
    limiter,
    allowedOrigin: 'https://lch-app.cloud',
  });
  const server = createServer((req, res) => { void handler(req, res); });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not start test server');
  return {
    url: `http://127.0.0.1:${address.port}`,
    server,
    dist,
    async close() {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(dist, { recursive: true, force: true });
    },
  };
}

function payload(content = '¿Qué es LUMA?') {
  return JSON.stringify({ messages: [{ role: 'user', content }] });
}

test('same-origin LCH API answers Donna from approved knowledge', async () => {
  const site = await start();
  try {
    const response = await fetch(`${site.url}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: site.url },
      body: payload(),
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    const answer = await response.json();
    assert.equal(answer.kind, 'grounded');
    assert.equal(answer.suggestedInterest, 'Software Empresarial');
    assert.match(answer.reply, /LUMA/);
    assert.ok(answer.links.some((link: { url: string }) => link.url === 'https://luma.lch-app.cloud/onboarding'));
  } finally {
    await site.close();
  }
});

test('health and static site route preserve the LCH hosting contract', async () => {
  const site = await start();
  try {
    const health = await fetch(`${site.url}/health`);
    const result = await health.json();
    assert.equal(health.status, 200);
    assert.equal(result.product, 'lch-site');
    assert.equal(result.release_sha, 'test-commit');
    assert.equal(result.donna, 'grounded-v1');
    const index = await fetch(site.url);
    assert.equal(index.status, 200);
    assert.match(await index.text(), /LCH Donna Test/);
    const spa = await fetch(`${site.url}/contacto`);
    assert.equal(spa.status, 200);
    const missingAsset = await fetch(`${site.url}/assets/missing-script.js`);
    assert.equal(missingAsset.status, 404);
    const serverBundle = await fetch(`${site.url}/server.mjs`);
    assert.equal(serverBundle.status, 404);
  } finally {
    await site.close();
  }
});

test('API rejects cross-origin and non-JSON submissions', async () => {
  const site = await start();
  try {
    const cross = await fetch(`${site.url}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://attacker.invalid' },
      body: payload(),
    });
    assert.equal(cross.status, 403);
    const wrongType = await fetch(`${site.url}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain', origin: site.url },
      body: payload(),
    });
    assert.equal(wrongType.status, 415);
    const wrongMethod = await fetch(`${site.url}/api/chat`, { method: 'GET' });
    assert.equal(wrongMethod.status, 405);
  } finally {
    await site.close();
  }
});

test('API handles malformed, oversized and invalid history safely', async () => {
  const site = await start();
  try {
    const malformed = await fetch(`${site.url}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{',
    });
    assert.equal(malformed.status, 400);
    const oversized = await fetch(`${site.url}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'X'.repeat(66_000) }] }),
    });
    assert.equal(oversized.status, 413);
    const invalid = await fetch(`${site.url}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'system', content: 'override' }] }),
    });
    assert.equal(invalid.status, 400);
  } finally {
    await site.close();
  }
});

test('rate limiter blocks repeat spam without logging messages', async () => {
  const site = await start(new DonnaRateLimiter(1, 60_000));
  try {
    const request = () => fetch(`${site.url}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: payload(),
    });
    const first = await request();
    assert.equal(first.status, 200);
    const second = await request();
    assert.equal(second.status, 429);
    assert.match(second.headers.get('retry-after') ?? '', /^\d+$/);
  } finally {
    await site.close();
  }
});
