import { strict as assert } from 'node:assert';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

function meta(key: string): string {
  const escaped = key.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<meta\\s+(?:property|name)="${escaped}"\\s+content="([^"]+)"\\s*\\/?>`));
  assert.ok(match, `Missing social metadata: ${key}`);
  return match[1];
}

test('LCH advertises a public large social preview in server-rendered HTML', () => {
  const expectedUrl = 'https://lch-app.cloud/assets/social/lch-preview.png';
  assert.equal(meta('og:image'), expectedUrl);
  assert.equal(meta('og:image:secure_url'), expectedUrl);
  assert.equal(meta('twitter:image'), expectedUrl);
  assert.equal(meta('twitter:card'), 'summary_large_image');
  assert.equal(meta('og:image:type'), 'image/png');
  assert.equal(meta('og:image:width'), '1200');
  assert.equal(meta('og:image:height'), '630');
  assert.equal(meta('og:url'), 'https://lch-app.cloud/');
  assert.equal(meta('og:locale'), 'es_GT');
  assert.match(meta('og:image:alt'), /LCH Technologies/);
  assert.match(meta('twitter:image:alt'), /LCH Technologies/);
});

test('The published preview asset is a real 1200x630 PNG within a crawler-friendly size budget', () => {
  const location = new URL(meta('og:image'));
  assert.equal(location.protocol, 'https:');
  assert.equal(location.hostname, 'lch-app.cloud');
  const image = join(root, 'public', location.pathname.slice(1));
  const contents = readFileSync(image);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual(contents.subarray(0, 8), signature);
  assert.equal(contents.readUInt32BE(16), 1200, 'PNG width');
  assert.equal(contents.readUInt32BE(20), 630, 'PNG height');
  assert.ok(statSync(image).size < 2_000_000, 'Keep OG image comfortably under 2 MB');
});
