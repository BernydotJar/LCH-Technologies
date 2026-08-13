# GH-20 Fixer Report — Revision 1

## Architectural repair
The public-webhook production path was replaced by a private Firestore queue consumer. The reason is security and durability: the verified Quick Tunnel exposed the n8n web application root, while Firestore already provides a durable record that can be processed later.

## Code and workflow changes
- Initial `demoRequests` create now includes fixed `automationStatus: pending`.
- Canonical Firestore rules require that fixed initial value and keep public reads/updates/deletes denied.
- Added `LCH Website — Firestore Lead Processor`, scheduled every minute, bounded to 25 pending documents.
- Processor has no webhook node and exports no credentials or real project identifier.
- Processor scorer is tested against the canonical TypeScript scorer.
- Processor upsert is restricted to automation metadata fields and preserves original lead content by update mask semantics.
- The existing webhook workflow remains optional for development/testing only.

## Verification after repair
- `npm test`: 20/20 PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `git diff --check`: PASS.

## External work still required
- Assign a real Google Cloud Firestore credential in n8n.
- Execute private processor against the intended Firestore project.
- Verify/deploy live Firestore rules.
- Synchronize the updated create contract to the public AI Studio app.
