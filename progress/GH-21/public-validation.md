# GH-21 | Public release validation — 2026-10-09

**Published production commit:** `3583c340717f2d4a7397cca3df7ca5d1fe664614`.

## Release transport evidence
- Supervisor `lch-site`: RUNNING, new release's `dist/server.mjs`.
- `http://127.0.0.1:14175/health`: HTTP 200, `release_sha=3583c340...`, `donna=grounded-v1`.
- `https://lch-app.cloud/health`: HTTP 200 with the **same** production release SHA.
- `https://lch-app.cloud/`: HTTPS serves new built JS/CSS; Chromium DOM contains `donna-signal__sphere`, the rotating idea question and the Donna launcher.
- Browser `POST https://lch-app.cloud/api/chat` with real same-origin JSON request `Como funciona Evidence AI para buscar en documentos?`: HTTP 200, `kind=grounded`, `suggestedInterest=LCH Evidence AI`, three approved links.

## Independent browser after deploy
Command: `NODE_PATH=/workspace/projects/LUMA/node_modules LCH_SMOKE_URL=https://lch-app.cloud/ node scripts/donna-smoke.cjs`.

- 390px mobile: chat API PASS, consented handoff PASS, products PASS, keyboard close PASS, 0 page errors.
- 1365px desktop: chat API PASS, consented handoff PASS, products PASS, keyboard close PASS, 0 page errors.
- Test harness now waits for Contact's asynchronous React effect before checking the handoff form; this repaired a false-negative assertion under production load, not a product defect.
- Earlier focused GH-21 local QA verified the orb, idea rotation, user-activated contextual prompts, reduced-motion behavior and the absence of automatic Firestore writes.

## Rollback
The prior immutable release `a23f41a7f6ba855d8502ec23222920e677ab2dc6` and the supervisor configuration snapshot `lch-site-supervisord.conf.pre-gh21-donna-orb` are preserved for restoration.

## Explicitly open evidence limitations
- Granite's local critic failed due sandbox OOM; no model verdict.
- The new standalone combined 1365px accelerated experience test remains incomplete under severe shared compute load; separate real-timing desktop focus and post-deploy baseline browser checks passed.
- No new LLM provider, Firestore schema, cron, credential, sales notification or chat persistence was added.

**Public deployment gate recommendation: PASS** for shipped scoped functionality. End-to-end commercial sales notification remains outside GH-21 scope.
