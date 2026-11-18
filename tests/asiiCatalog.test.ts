import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = readFileSync(root + '/src/components/ProductReferences.tsx', 'utf8');
const analytics = readFileSync(root + '/src/analytics/client.ts', 'utf8');
const translations = readFileSync(root + '/src/i18n/products.ts', 'utf8');

test('ASII appears in the LCH catalog but is never presented as a public demo', () => {
  const card = catalog.match(/\{\s*id: 'asii',[\s\S]*?\n  \},/);
  assert.ok(card, 'ASII product card missing');
  assert.match(card[0], /url: 'https:\/\/asii\.lch-app\.cloud\//);
  assert.match(card[0], /embed: false/);
  assert.match(card[0], /live: false/);
  assert.match(card[0], /publicAvailable: false/);
  assert.match(card[0], /Acceso privado/);
  assert.match(catalog, /active\.id === 'asii' \?/);
  assert.match(catalog, /<AsiiPreview \/>/);
  assert.match(catalog, /Public illustration only\. Never embeds or fetches the private ASII origin/);
  assert.match(catalog, /Acceso restringido · solicitar autorización/);
});

test('existing LUMA product remains present and interactive', () => {
  const card = catalog.match(/\{\s*id: 'luma',[\s\S]*?\n  \},/);
  assert.ok(card);
  assert.match(card[0], /publicAvailable: true/);
  assert.match(card[0], /embed: true/);
  assert.match(card[0], /luma\.lch-app\.cloud/);
  assert.match(catalog, /<iframe/);
});

test('no private ASII URL is fetched by public illustration and analytics is bounded', () => {
  const preview = catalog.split('const AsiiPreview = () => {')[1]?.split('export const ProductReferences =')[0];
  assert.ok(preview);
  assert.doesNotMatch(preview, /fetch\(|<iframe|\.lch-app\.cloud\/api|useEffect\(/);
  assert.match(analytics, /'meridian' \| 'asii'/);
  assert.match(translations, /'Private Knowledge Intelligence'/);
  assert.match(translations, /'Product Lab \/ 04 product references'/);
});
