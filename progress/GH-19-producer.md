# GH-19 Producer Report

## Implemented
- Pure lead contract validation/normalization under `src/integrations/leadContract.ts`.
- Bounded best-effort webhook delivery under `src/integrations/leadAutomation.ts`.
- Firestore-first persistence in `src/integrations/demoRequests.ts`; n8n failure no longer invalidates a persisted lead.
- Optional `VITE_N8N_WEBHOOK_URL` configuration.
- Hardened canonical `firestore.rules` with exact schema, bounded types/lengths, consent=true, fixed source/status, server timestamp, and denied public reads/updates/deletes.
- Credential-free importable n8n workflow `LCH Website — Lead Intake` with POST webhook, validation, deterministic scoring, HOT/WARM/LOW routing, and explicit 202/400 responses.
- Unit/contract tests and lead automation documentation.

## Verification completed
- `npm test`: 14/14 PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Workflow JSON parses and contains no exported credentials or obvious private-key/API-key material.

## Build observation
The dynamically loaded Firestore submission chunk is ~501 kB minified and triggers Vite's 500 kB warning. The initial JS bundle remains ~383 kB; the large chunk is not loaded until form submission.

## Runtime integration status
The user's Mac n8n instance is healthy and reachable from the harness, but the remote-debug Chrome profile is not authenticated for `/rest/workflows`. A nested-sandbox n8n image validation attempt failed at the old nested Docker daemon layer-registration step (`archive/tar: invalid tar header`) after download; this is infrastructure noise, not a workflow result.

Actual import/execution against the user's n8n instance remains pending independent/external validation.
