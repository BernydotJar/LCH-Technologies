# LCH Website — Graph Harness Current State

- GH-18 — Graph recovery/canonicalization: DONE.
- GH-19 — Durable Firestore-first lead capture + real n8n webhook workflow: DONE, revision 2, live n8n gate PASS.
- GH-20 — Private production automation transport: RUNNING, revision 2; technical runtime PASS.
  - Repository checks: 20/20 tests, typecheck, build, audit, diff/secret checks PASS.
  - Live strict Firestore rules: PASS.
  - Public AI Studio contract and form: PASS.
  - Dedicated least-privilege Firestore service account: PASS.
  - n8n credential connection test: PASS.
  - Real pending query -> scoring -> Firestore upsert: PASS.
  - Synthetic lead no longer eligible for pending queue after processing: PASS.
  - Private workflow: Published; one-minute Schedule Trigger enabled.
  - Public n8n ingress: none required; Quick Tunnel remains out of production.
  - Key hygiene: two unused keys revoked; one n8n key remains active.
  - Remaining release blocker: delete the downloaded service-account JSON on the user's Mac and clear clipboard residue.
- GH-17 — Production deployment human gate: pending downstream of GH-20 and still requires explicit release authorization.

Current terminal assessment: not terminal; one local secret-cleanup action can close GH-20, after which GH-17 is the final gated human release decision.
