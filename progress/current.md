# LCH Website — Graph Harness Current State

- GH-18 — Graph recovery/canonicalization: DONE.
- GH-19 — Durable Firestore-first lead capture + real n8n webhook workflow: DONE, revision 2, live n8n gate PASS.
- GH-20 — Private production automation transport: RUNNING, revision 1.
  - Producer/repair artifacts: implemented.
  - Tests: 20/20 PASS.
  - Typecheck/build/audit: PASS.
  - Quick Tunnel: externally validated, rejected for production, and stopped.
  - Preferred production path: Firestore `automationStatus=pending` -> private scheduled n8n processor.
  - Blockers: Google Firestore credential assignment in n8n, live Firestore rules deploy/verification, public AI Studio create-contract synchronization.
- GH-17 — Production deployment human gate: pending and remains downstream of GH-20.

Current terminal assessment: not terminal yet while human-authenticated external actions may unlock GH-20.
