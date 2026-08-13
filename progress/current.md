# LCH Technologies — Graph Harness Current State

## Execution policy
- execution: graph
- reasoning: engineering
- human evaluations: gated
- Graph Harness runtime pin: `477bdcc3d390c30eb49d823e5c7fd105fee2cc4d`

## Canonical repository
`BernydotJar/LCH-Technologies`

Working branch: `feature/graph-n8n-lead-automation`

## Active graph
- GH-18 — Graph state recovery and canonicalization — DONE, revision 1, gate PASS, checkpoint recorded.
- GH-19 — Durable lead capture with n8n follow-up automation — REVIEW, revision 1, implementation gate BLOCKED only on real n8n import/execution.
- GH-20 — Protected public automation transport and production validation — waiting on GH-19.
- GH-17 — Production deployment human gate — waiting on GH-20.

## GH-19 repository verification
- tests: 16/16 PASS
- TypeScript: PASS
- Vite production build: PASS
- production dependency audit: 0 vulnerabilities
- secret-pattern scan: PASS
- `git diff --check`: PASS
- Critic findings on scoring parity and untrusted client time: repaired and re-reviewed PASS

## Human/runtime gate
The Mac n8n service is healthy, but the Chrome remote-debug profile used by the harness is not authenticated to n8n. Its sign-in page is open at `http://localhost:5678/signin`. The user must sign in there without sharing credentials. After authentication, the harness can import and execute the workflow using the browser session.

## Recovered legacy state
GH-00 through GH-16 are preserved as legacy DONE statuses from AI Studio. They are explicitly not represented as ledger-backed v1 completion evidence.

## Current external systems
- Public website mirror: AI Studio `ais-pre` URL.
- Durable lead store: Firestore `demoRequests`.
- Local automation engine: n8n Docker on the user's Mac, reachable from the harness workspace at `host.docker.internal:5678`.

## Open risks
See `graph/recovery/open-risks.md`.
