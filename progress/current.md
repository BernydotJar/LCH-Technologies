# LCH Website — Graph Harness Current State

- GH-18 — Graph recovery/canonicalization: DONE.
- GH-19 — Durable Firestore-first lead capture + real n8n webhook workflow: DONE, revision 2, live n8n gate PASS.
- GH-20 — Private production automation transport: RUNNING, revision 2.
  - Private Firestore polling architecture: implemented.
  - Firestore service-account auth mode repair: implemented and regression-tested.
  - Tests: 20/20 PASS; typecheck/build/audit/diff/secret scan: PASS.
  - Quick Tunnel: externally validated, rejected for production, and stopped.
  - Live Firestore rules: deployed and independently reloaded from the named LCH database.
  - Public AI Studio contract: synchronized and verified in the public `ais-pre` bundle.
  - Public synthetic form submission: PASS under strict live rules.
  - Dedicated `lch-n8n-firestore` identity: enabled, `roles/datastore.user` assigned, exactly one active user-managed key verified.
  - Remaining external gate: local n8n editor session must be re-authenticated and the private key pasted locally into the prepared Google Service Account credential. The harness will not extract private-key material from the user's downloaded JSON.
- GH-17 — Production deployment human gate: pending downstream of GH-20.

Current terminal assessment: not terminal; one human-authenticated secret-entry step can unlock the remaining GH-20 runtime verification.
