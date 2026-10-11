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


## GH-28 — LCH n8n commercial mail activation hardening (2026-10-10)

- Product decision remains Firebase **Spark**, zero new Firebase billing/Cloud Functions, one existing n8n executor only.
- A confirmed **Mac Chrome n8n** and **Cloud Sandbox n8n-lina** are distinct localhost servers. Mac lists only Lina and zero credentials; sandbox contains Lina + LCH inactive and zero credentials.
- GH-28 adds Firestore CAS claim verification, strict Outlook `{success:true}` acceptance verification, and a CAS-protected dead-letter branch for >=7 failed attempts, with no unwanted emails.
- Focused n8n 14/14, preflight 4/4, full LCH 91/91, TypeScript and guarded build PASS. Sandbox n8n 13-node inactive import, unchanged Lina hash and exact runtime/source JSON match PASS; GH-27 keeper still RUNNING.
- Microsoft OAuth2 Client ID and Client Secret plus Firestore service identity remain unconfigured; no emails sent, no actual four-mailbox delivery evidence. **Public delivery gate NOT PASS**.
- Runbook: `docs/lch-n8n-activation-runbook.md`; preflight: `scripts/lch_n8n_release_preflight.py`; Graph node GH-28.


## GH-29 — Google IAM Spark lead-mail principal (2026-10-10)

- Created `lch-lead-mail-n8n@rag-municipalidades.iam.gserviceaccount.com` with exactly one direct conditional `roles/datastore.user` binding scoped to the LCH named Firestore database; prior LCH SA and n8n Lina untouched.
- Independent read-only Google IAM API audit: 1 conditional project binding, 0 broad grants, 0 user-managed keys. Effective Firestore read/write from the service principal NOT yet verified.
- Automatic private key creation/import blocked by platform safety control; no credential created or mail sent. n8n LCH workflow remains INACTIVE with 0 credentials, Firebase remains Spark.
- Runbook `docs/lch-google-iam-lead-mail.md`; Microsoft delegated custom scopes/Send As requirements clarified. External credential and four-inbox delivery gate PENDING.
