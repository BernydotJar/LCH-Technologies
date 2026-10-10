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
- GH-21 — Donna signal orb and curated rotating ideas: DONE; `donna_premium_quality` and `donna_public_release` PASS. Proven on the public LCH domain.
- GH-22 — Semantic Donna Contact and reliable Firebase build: DONE, revision 1; `gh22_semantic_quality` and `gh22_contact_production` PASS.
  - The website's missing Firebase config regression was reproduced and fixed with a guarded production build. Public Firestore receipt confirmed.
  - One-sentence and guided contact drafts use the exact seven Contact fields; no DOM scraping, automatic consent or lead submission.
  - Adversarial repair prevents obvious out-of-schema private details from reaching `/api/chat` or contact `mensaje`.
  - 55/55 tests, TypeScript, guarded build and Playwright mobile/desktop/public QA PASS.
  - Public HTTPS production release: `fe93dcf985dd83508dcef1b5a2a40054ef07ff7f`, rollback preserved.
  - Microsoft 365/Outlook sales notifications remain **not integrated**; Firestore receipt does not imply email delivery.

- GH-23 — Donna conversational CX refinement: DONE; `gh23_conversation_quality` and `gh23_public_release` PASS.
  - Intent-aware contact flow, a single primary contact action, natural missing-data questions, honest grounded clarification and topic suggestions.
  - Private form turns are excluded from requests to `/api/chat` after returning to product exploration.
  - 63/63 tests, TypeScript, Firebase-guarded build, complete 390px/1365px staging Playwright suites and original chat/semantic-contact regressions PASS.
  - Public HTTPS release: `5e08515ba5a0aec6918dea3dea31d5b924fda0b0`. Health, client asset fingerprint, grounded API, targeted mobile and desktop browser flows PASS.
  - Combined three-page browser suite on the public host was INCOMPLETE under exceptional shared-sandbox load; its individual critical public scenarios and the complete exact-build staging suite passed.
  - Cloudflare `/cdn-cgi/rum` telemetry was excluded from the no-lead-POST E2E assertion; the test still forbids unexpected `/api/chat` or Firestore writes.
  - Microsoft 365 sales notifications remain **not configured** by this work.

Graph Harness: 143-event append-only chain validated; no READY nodes remain.

Delivery state: GH-23 release is live, merged to `main`, with public transport and scoped browser verification at `https://lch-app.cloud`. See `progress/GH-23/public-validation.md` for the explicitly documented combined-browser execution limit.

Housekeeping note: automatic deletion of the synthetic GH-20 Firestore verification records was not performed because the environment safety layer blocked direct record manipulation in Firestore Studio. The verified processed record is no longer in the pending automation queue. This does not block the production transport or release gates.
