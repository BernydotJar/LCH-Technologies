# GH-22 — Reliable contact capture + Donna semantic form preparation

## User intent
The website's customer contact form emits "No pudimos confirmar la recepción...".
The user showed an MCP UI prototype with declarative form/tool fields and asked Donna to fill fields semantically rather than scrape the DOM.

## Actual production finding
A public browser test on LCH reproduced the error before any Firestore call:
`Missing contact integration configuration: projectId`.
The deployed Vite bundle did not embed its required Firebase Web SDK config.
A **configured immutable rebuild** from current main was deployed and publicly tested.
Public response: Firestore HTTP 200 and visible lead reference `I1UQAFRO5U`.
This verifies capture but **does not** establish sales-email delivery.

## Scope
1. Default production build must FAIL CLOSED without the seven Firebase `VITE_CONTACT_*` build-time values. Preserve secrets in ignored runtime local config, never in Git.
2. Single schema/semantic contract `prepare_lch_contact_form`: exact keys `nombre, apellido, email, empresa, cargo, interes, mensaje` with allowed interest enum and field limits from the existing Lead Contract. No consent field in the assistant tool.
3. Donna prepares only contact-form fields, **without DOM scraping**. Incrementally extract explicitly volunteered names/roles/emails/companies and business needs. Never invent values.
4. Chat-guided local collection: ask missing fields one at a time and prepare a draft in React memory; no network submission or Firestore writes for preparing data. Normal questions continue to use same-origin `/api/chat`.
5. Donna-to-contact handoff carries typed `ContactDraft` values, merges them without overwriting user-edited nonempty fields, displays review notice, and leaves consent unchecked.
6. Existing FormData/Firestore validation remains authoritative. Only a human click in Contact triggers persistence.
7. Responsive mobile/desktop, keyboard, back/reset/close, accessible status, and no PII logging.
8. Document product limitation: this release is **schema-driven local interpretation plus guided slot filling**, not a new generative LLM or production MCP UI server. The contract is compatible with adding an LLM/tool bridge later.

## Not in scope
- Implementing a universal browser scraper or granting an agent DOM permissions.
- Storing chat transcripts or personal details from chat without explicit form submission.
- Sending outbound commercial notifications (currently not configured).
- Exposing n8n as a public browser webhook.
- Copying design/runtime from the MCP demo or introducing a new model provider without reviewed privacy policy.

## Graph
Producer -> Product/CX Critic -> Fixer -> Independent Verifier -> Release Gate -> Evidence.
Evidence: contract and safety tests, build-fail-closed test, Playwright chat -> structured draft -> editable form -> explicit submission, production Firestore persistence, HTTPS health.

## Required checks
- 100% semantic contract validation and PII/safety negative tests.
- `npm run check`, `npm run build:deploy` with configured env.
- Unconfigured `npm run build` must exit nonzero before Vite emits assets.
- Browser smoke in local stage at 390px and 1365px: fill correct values from sentence and guided prompts; no auto-consent/no Firestore POST before submit.
- Real public production synthetic submission success after release; rollback preserved.
