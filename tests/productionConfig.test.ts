import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../scripts/check-production-env.mjs', import.meta.url));

const exampleConfig = [
  'VITE_CONTACT_PROJECT_ID=example-project',
  'VITE_CONTACT_APP_ID=example-app',
  'VITE_CONTACT_API_KEY=public-browser-sdk-key',
  'VITE_CONTACT_AUTH_DOMAIN=example.firebaseapp.com',
  'VITE_CONTACT_STORAGE_BUCKET=example.appspot.com',
  'VITE_CONTACT_MESSAGING_SENDER_ID=123456789',
  'VITE_CONTACT_DATABASE_ID=example-database',
].join('\n') + '\n';

function checkWith(config?: string) {
  const workingDirectory = mkdtempSync(join(tmpdir(), 'lch-config-gate-'));
  try {
    if (config !== undefined) {
      writeFileSync(join(workingDirectory, '.env.production.local'), config);
    }
    return spawnSync(process.execPath, [script], {
      cwd: workingDirectory,
      encoding: 'utf8',
      env: { PATH: process.env.PATH ?? '' },
    });
  } finally {
    rmSync(workingDirectory, { recursive: true, force: true });
  }
}

test('blocks production build without a contact config', () => {
  const result = checkWith();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing Firebase contact configuration/);
});

test('accepts all seven public Firebase web configuration fields', () => {
  const result = checkWith(exampleConfig);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /configuration validated/);
});

test('rejects browser-facing n8n webhook even with complete Firebase config', () => {
  const result = checkWith(exampleConfig + 'VITE_N8N_WEBHOOK_URL=https://example.test/webhook\n');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /direct public n8n webhook/);
});
