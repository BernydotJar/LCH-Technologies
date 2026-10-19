# GH-32 — Independent pre-release verification

**Candidate state: implementation_quality PASS, production_transport NOT YET VERIFIED.**

Workspace: existing `cloud-sandbox-dev-main`, checkout `/workspace/projects/LCH-gh32-intelligent-landing`; no extra container.

Commands and outcomes:
- `npm ci --ignore-scripts --no-audit --no-fund`: PASS
- `npm test`: **99/99 PASS**
- `npm run typecheck`: PASS
- `npm run build:deploy`: PASS (synthetic public Firebase parameters for staging only; `dist/server.mjs` generated)
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities
- `node scripts/opportunity-smoke.cjs` with `LCH_SMOKE_URL=http://127.0.0.1:42132`: PASS (390px, 1365px, locale ES/EN/PT, challenge flow, no hidden POST, consent, Donna)
- `node scripts/donna-live-form-smoke.cjs`: PASS (390px, 1365px)
- `node scripts/lch-ux-smoke.cjs`: PASS (320px, 375px, 390px, 768px, 1365px, no reported errors)
- `git diff --check`: PASS
- `Graph Harness validate`: 204-event source chain valid before GH-32 append.

**Verifier boundaries:** This is independent behavior verification of a synthetic-data build. No claim that synthetic config is valid for real Firestore or that Microsoft 365 mail notifications are delivered. The real production release must use the already protected non-exported Firebase build config in the existing workstation and preserve supervised Node hosting and rollback.

**Visual snapshot evidence:** see [Producer](producer.md) and the three JPEGs in `visual/`.
