# GH-23 — Public deployment verification

**Production release:** `5e08515ba5a0aec6918dea3dea31d5b924fda0b0`
**Origin:** `https://lch-app.cloud`
**Pull Request:** #20 (merged to `main`)

## Release integrity and transport
- Immutable release path: `/workspace/.deployment-tools/lch-site-runtime/releases/5e08515ba5a0aec6918dea3dea31d5b924fda0b0`.
- Supervisor `lch-site` reported RUNNING after cutover.
- Public GET `/health`: HTTP 200, product `lch-site`, exact release SHA `5e08515...`.
- Public Vite JS asset `assets/index-CPgsB9QV.js` matches the immutable candidate build by fingerprint.
- `POST /api/chat` for unknown office-extension question returned `kind=clarify`, no contact links, honest grounded-topic prompt. HTTP 200.
- Build guard checked seven Firebase SDK public parameters and verified their presence in the compiled Firestore chunk.
- Pre-change supervisor config `lch-site-supervisord.conf.pre-gh23-donna-cx` and prior release `fe93dcf...` remain available for rollback.

## Independent public browser evidence
- **Mobile 390px:** new GH-23 Playwright completed the unknown-question → grounded suggestion → single CTA → guided intro → private-contact turn → return to grounded product answer segment. Assertions confirmed no replay of `Ana Perez` or local guide prompts in request body and no Firestore lead creation. Also independently completed direct `Quiero hablar con el equipo` → one question, zero `/api/chat` and Firestore POST, unchecked consent.
- **Desktop 1365px:** focused Chromium public run asked `¿Cuánto cuesta LUMA?`, received candid pricing limitation and confirmed exactly one primary `Preparar una solicitud` button plus one discreet direct-form text link.
- **Mobile welcome/direct entry:** focused Chromium public run confirmed the new first question `¿Cuál es tu nombre?`, no `0 datos` copy and no duplicate CTA.
- **Public all-scenario GH-23 script:** the first run was interrupted by an extremely overloaded shared sandbox. A later run completed mobile exploration and direct-contact scenarios but timed out while launching the third Chromium page for pricing. This is **INCOMPLETE as a combined public suite**, not a PASS. Desktop pricing was verified separately. Full three-scenario test passed for both 390px and 1365px against the exact immutable compiled release in the staging server.
- **Telemetry caveat:** Cloudflare's normal `/cdn-cgi/rum` browser-performance POST was initially misclassified by a test harness that treated every POST as a lead. The harness now watches specifically `/api/chat` and `firestore.googleapis.com`. This is a test fix, not a change to the product or Firebase submit flow.

## Pre-deploy complete regressions
- **63/63** unit+integration tests, TypeScript, guarded production build PASS.
- New GH-23 full end-to-end Playwright: 390px and 1365px, unknown/clarify/topics, one CTA, no private-history replay, guided-copy, direct intent, pricing, direct form bypass, consent PASS.
- Donna original baseline (both widths): grounded chat API, product knowledge, keyboard Escape and form handoff PASS.
- Semantic contact GH-22 regression (both widths plus guided/private-data scenarios): seven fields, human edits preserved, consent unchecked, 0 unrequested API/Firestore writes, PASS.

## Data/privacy and operations
- Chat endpoint is deterministic grounded knowledge, **not** a live generative LLM.
- Private contact details remain local during collection. The outbound chat-history filter also drops private guide messages when returning to exploration.
- Firestore contact submission logic was **not modified** by GH-23. The seven Firebase parameters were present in the published bundle. An earlier GH-22 real public synthetic Firestore receipt already verified persistence; this rollout did not create another test lead.
- No automatic consent, booking, CRM write from chat, or Microsoft 365 sales notification was introduced.

## Decision
**Production gate: PASS with disclosed combined-public-browser test gap.** Real public release fingerprint, HTTPS health, API contract and targeted mobile/desktop browser behaviors were verified. The exact build also passed all complete local/staging suites. Keep the prior immutable release for immediate rollback.
