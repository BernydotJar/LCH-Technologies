import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { createSiteHandler } from '../server/handler.ts';
import { validateCanonicalOrigin } from '../server/localizedHead.ts';

async function start(canonicalOrigin?: string) {
  const dist = await mkdtemp(join(tmpdir(), 'lch-domain-'));
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  await writeFile(join(dist, 'index.html'), html);
  const handler = createSiteHandler({ distDir: dist, releaseSha: 'gh31-test', canonicalOrigin });
  const server: Server = createServer((req, res) => { void handler(req, res); });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server unavailable');
  return {
    url: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(dist, { recursive: true, force: true });
    },
  };
}

test('GH-31 default canonical remains the existing live domain before DNS cutover', async () => {
  const site = await start();
  try {
    const response = await fetch(site.url);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /rel="canonical" href="https:\/\/lch-app\.cloud\/"/);
    assert.match(html, /property="og:url" content="https:\/\/lch-app\.cloud\/"/);
  } finally { await site.close(); }
});

test('GH-31 new production domain rewrites canonical, hreflang, social URLs and JSON-LD', async () => {
  const site = await start('https://lch-technologies.com');
  try {
    const response = await fetch(site.url);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /rel="canonical" href="https:\/\/lch-technologies\.com\/"/);
    assert.match(html, /hreflang="en" href="https:\/\/lch-technologies\.com\/\?lang=en"/);
    assert.match(html, /property="og:url" content="https:\/\/lch-technologies\.com\/"/);
    assert.match(html, /property="og:image" content="https:\/\/lch-technologies\.com\/assets\/social\/lch-preview-original\.png"/);
    assert.match(html, /name="twitter:image" content="https:\/\/lch-technologies\.com\/assets\/social\/lch-preview-original\.png"/);
    assert.match(html, /"url": "https:\/\/lch-technologies\.com"/);
    assert.doesNotMatch(html, /https:\/\/lch-app\.cloud/);
  } finally { await site.close(); }
});

test('GH-31 localized HTML renders the same canonical production domain', async () => {
  const site = await start('https://lch-technologies.com');
  try {
    for (const language of ['en', 'pt']) {
      const response = await fetch(`${site.url}/?lang=${language}`);
      const html = await response.text();
      assert.equal(response.status, 200);
      assert.match(html, new RegExp('rel="canonical" href="https://lch-technologies\\.com/\\?lang=' + language + '"'));
      assert.match(html, new RegExp('property="og:url" content="https://lch-technologies\\.com/\\?lang=' + language + '"'));
      assert.match(html, /hreflang="es" href="https:\/\/lch-technologies\.com\/"/);
      assert.doesNotMatch(html, /https:\/\/lch-app\.cloud/);
    }
  } finally { await site.close(); }
});

test('GH-31 rejects unapproved or insecure canonical-origin values before listening', () => {
  for (const invalid of [
    'http://lch-technologies.com',
    'https://evil.invalid',
    'https://www.lch-technologies.com',
    'https://lch-technologies.com.evil.invalid',
    'https://lch-technologies.com/path',
    'https://lch-technologies.com?x=1',
    'https://user@lch-technologies.com',
    '',
  ]) {
    assert.throws(() => validateCanonicalOrigin(invalid), /Invalid LCH_CANONICAL_ORIGIN/);
    assert.throws(() => createSiteHandler({ distDir: '/tmp', releaseSha: 'test', canonicalOrigin: invalid }), /Invalid LCH_CANONICAL_ORIGIN/);
  }
  assert.equal(validateCanonicalOrigin('https://lch-technologies.com/'), 'https://lch-technologies.com');
});
