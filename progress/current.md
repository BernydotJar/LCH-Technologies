# LCH Website — Graph Harness Current State

- GH-18 — Graph recovery/canonicalization: DONE.
- GH-19 — Durable Firestore-first lead capture + real n8n webhook workflow: DONE, revision 2, live n8n gate PASS.
- GH-20 — Private production automation transport: BLOCKED on one external credential action, revision 1.
  - Producer/repair artifacts: implemented.
  - Tests: 20/20 PASS.
  - Typecheck/build/audit: PASS.
  - Quick Tunnel: externally validated, rejected for production, and stopped.
  - Preferred production path: Firestore `automationStatus=pending` -> private scheduled n8n processor.
  - Live Firestore rules: deployed and independently reloaded from the named LCH database.
  - Public AI Studio contract: synchronized, persisted, and verified in the `ais-pre` bundle.
  - Public synthetic form submission: PASS under strict live rules.
  - Remaining blocker: dedicated least-privilege Google Firestore credential assignment in n8n.
- GH-17 — Production deployment human gate: pending and remains downstream of GH-20.

Current terminal assessment: not terminal yet while human-authenticated external actions may unlock GH-20.
