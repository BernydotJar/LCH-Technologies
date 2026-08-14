# LCH Website — Graph Harness Current State

- GH-18 — Graph recovery/canonicalization: DONE.
- GH-19 — Durable Firestore-first lead capture + real n8n webhook workflow: DONE, revision 2, live n8n gate PASS.
- GH-20 — Private production automation transport: final verification PASS, revision 2; ready to close.
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
  - Local credential cleanup: PASS; fresh Downloads listing contains no service-account JSON files and clipboard cleanup was confirmed.
- GH-17 — Production deployment human gate: SPEC_READY downstream of GH-20; explicit human release authorization recorded and ready once GH-20 closes.

Current terminal assessment: release gates are ready for final Graph Harness evaluation and merge.
