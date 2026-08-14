# GH-19 Fixer Report

## Repairs applied

### F1 — scoring drift
Added dynamic workflow-code execution tests. The test harness extracts the actual `Validate and Score` JavaScript embedded in the exported n8n workflow, executes it against representative envelopes, and compares `priority`, `score`, and `reasons` with the canonical TypeScript scorer.

Result after repair: HOT/WARM/LOW parity PASS and malformed-envelope rejection PASS.

### F2 — untrusted client time
The workflow no longer exposes the browser-provided timestamp as authoritative workflow time. It now records:
- `clientSubmittedAt`: the optional browser value;
- `receivedAt`: generated inside the n8n Code node using the automation runtime clock.

### Regression verification
- `npm test`: 16/16 PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- secret-pattern scan: PASS.
- `git diff --check`: PASS.

## Remaining gate
F3 is not code repair. Actual import/execution on the user's n8n runtime requires an authenticated n8n browser/API session. No credentials will be requested or extracted.
