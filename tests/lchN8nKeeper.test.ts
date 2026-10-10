import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/lch-n8n-keepalive.sh', import.meta.url));
const temp = mkdtempSync(path.join(tmpdir(), 'lch-n8n-keeper-test-'));
process.on('exit', () => rmSync(temp, { recursive: true, force: true }));

function fixture(healthy: boolean) {
  const dir = mkdtempSync(path.join(temp, 'run-'));
  const bin = path.join(dir, 'bin');
  mkdirSync(bin);
  const state = path.join(dir, 'health');
  const recovered = path.join(dir, 'recovered');
  writeFileSync(state, healthy ? 'healthy' : 'down');
  const curl = path.join(bin, 'curl');
  writeFileSync(curl, '#!/bin/sh\n[ "$(cat "$LCH_N8N_HEALTH_STATE")" = "healthy" ]\n');
  const start = path.join(dir, 'start.sh');
  writeFileSync(start, '#!/bin/sh\necho recovered > "$LCH_N8N_RECOVERY_MARK"\necho healthy > "$LCH_N8N_HEALTH_STATE"\n');
  chmodSync(curl, 0o755); chmodSync(start, 0o755);
  return { dir, bin, state, start, recovered };
}

function run(f: ReturnType<typeof fixture>, extras: Record<string, string> = {}) {
  return spawnSync('bash', [script], {
    encoding: 'utf8', timeout: 4000,
    env: {
      ...process.env,
      PATH: `${f.bin}:${process.env.PATH}`,
      LCH_N8N_ONCE: '1',
      LCH_N8N_START_SCRIPT: f.start,
      LCH_N8N_HEALTH_URL: 'http://127.0.0.1:5678/healthz',
      LCH_N8N_HEALTH_STATE: f.state,
      LCH_N8N_RECOVERY_MARK: f.recovered,
      LCH_N8N_LOCK_FILE: path.join(f.dir, 'keeper.lock'),
      ...extras,
    },
  });
}

test('GH-27 healthy existing n8n runtime is never restarted', () => {
  const f = fixture(true);
  const result = run(f);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(f.state, 'utf8'), 'healthy');
  assert.equal(result.stdout.includes('requesting recovery'), false);
});

test('GH-27 stopped runtime is recovered using only its existing start.sh', () => {
  const f = fixture(false);
  const result = run(f);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(f.state, 'utf8').trim(), 'healthy');
  assert.equal(readFileSync(f.recovered, 'utf8').trim(), 'recovered');
  assert.match(result.stdout, /runtime recovered/);
});

test('GH-27 bad polling interval is rejected without touching the runtime', () => {
  const f = fixture(false);
  const result = run(f, { LCH_N8N_INTERVAL_SECONDS: '0' });
  assert.equal(result.status, 64);
  assert.equal(result.stderr.includes('invalid poll interval'), true);
});

test('GH-27 missing start script stops instead of changing other containers', () => {
  const f = fixture(false);
  const result = run(f, { LCH_N8N_START_SCRIPT: path.join(f.dir, 'not-found') });
  assert.equal(result.status, 64);
});


test('GH-27 unexpected keeper termination never leaks its lock to child sleep processes', async () => {
  const f = fixture(true);
  const lock = path.join(f.dir, 'keeper.lock');
  const child = spawn('bash', [script], {
    stdio: 'ignore',
    env: {
      ...process.env,
      PATH: `${f.bin}:${process.env.PATH}`,
      LCH_N8N_ONCE: '0',
      LCH_N8N_INTERVAL_SECONDS: '4',
      LCH_N8N_START_SCRIPT: f.start,
      LCH_N8N_HEALTH_URL: 'http://127.0.0.1:5678/healthz',
      LCH_N8N_HEALTH_STATE: f.state,
      LCH_N8N_RECOVERY_MARK: f.recovered,
      LCH_N8N_LOCK_FILE: lock,
    },
  });
  try {
    await delay(250);
    assert.equal(child.exitCode, null);
    assert.notEqual(spawnSync('flock', ['-n', lock, '-c', 'true']).status, 0, 'keeper must own its lock');
    child.kill('SIGTERM');
    await delay(150);
    assert.equal(spawnSync('flock', ['-n', lock, '-c', 'true']).status, 0, 'child sleep must not inherit keeper lock');
  } finally {
    if (child.exitCode === null) child.kill('SIGKILL');
  }
});
