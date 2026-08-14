# LCH Website — Graph Harness Current State

- GH-18 — Graph recovery/canonicalization: DONE; `recovery_integrity` PASS.
- GH-19 — Durable Firestore-first lead capture + real n8n webhook workflow: DONE, revision 2; `implementation_quality` PASS.
- GH-20 — Private production automation transport: DONE, revision 2; `production_transport` PASS.
  - Repository checks: 20/20 tests, typecheck, build, audit, diff/secret checks PASS.
  - Live strict Firestore rules: PASS.
  - Public AI Studio contract and form: PASS.
  - Dedicated least-privilege Firestore service account: PASS.
  - n8n credential connection test: PASS.
  - Real pending query -> scoring -> Firestore upsert: PASS.
  - Processed synthetic lead is no longer eligible for the pending queue.
  - Private workflow: Published; one-minute Schedule Trigger enabled.
  - Public n8n ingress: none required; Quick Tunnel remains out of production.
  - Key hygiene: two unused keys revoked; one n8n key remains active.
  - Local credential cleanup: PASS; fresh Downloads listing contains no service-account JSON files and clipboard cleanup was confirmed.
- GH-17 — Production deployment human gate: DONE; explicit human approval recorded and `release_authorization` PASS.

Graph Harness: 84-event append-only chain validated; no READY nodes remain.

Delivery state: release authorized for PR #2 merge to `main`.

Housekeeping note: automatic deletion of the synthetic GH-20 Firestore verification records was not performed because the environment safety layer blocked direct record manipulation in Firestore Studio. The verified processed record is no longer in the pending automation queue. This does not block the production transport or release gates.
