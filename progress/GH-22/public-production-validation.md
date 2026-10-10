# GH-22 | Final public production verification

**Public release:** `fe93dcf985dd83508dcef1b5a2a40054ef07ff7f`
**Origin:** `https://lch-app.cloud`

## Public transport and build
- GitHub PR #17 merged original semantic contract to main as `e0443ef`.
- GitHub PR #18 merged bounded privacy repair to main as `fe93dcf`.
- `supervisorctl status` reports `lch-site RUNNING`; immutable deployment path `/workspace/.deployment-tools/lch-site-runtime/releases/fe93dcf985dd83508dcef1b5a2a40054ef07ff7f`.
- `GET https://lch-app.cloud/health`: HTTP 200, correct `release_sha=fe93dcf...`. Local relay health reports the same commit.
- The deployed Vite bundle was built by `npm run check` and contains all seven configured Firebase Web SDK parameters; no browser-facing n8n webhook.
- `check-production-env.mjs` tested from a clean directory without Firebase parameters, correctly exits nonzero and names missing variables.
- Previous immutable public build and supervisord configuration `lch-site-supervisord.conf.pre-gh22-privacy-hotfix` preserved for rollback.

## Independent browser verification on public HTTPS
Command: `NODE_PATH=/workspace/projects/LUMA/node_modules LCH_SMOKE_URL=https://lch-app.cloud/ node scripts/semantic-contact-smoke.cjs`.

- 390px mobile: natural-language contact intake populated all seven allowed fields correctly; **PASS**.
- 1365px desktop: identical seven-field semantic contract; **PASS**.
- Guided intake: missing-field questions, user edits have precedence, consent remains false, **0** Firestore POST, **0** /api/chat POST while collecting; **PASS**.
- Unsupported private data: phone-only message triggered local explanation, **0** Firestore POST and **0** /api/chat POST; business message remained empty and consent unchecked; **PASS**.
- All new scenarios reported **0 JavaScript page errors**.
- Existing `scripts/donna-smoke.cjs` against HTTPS: both 390px and 1365px baseline chat API, product knowledge, handoff, consent and keyboard close **PASS** with **0 JavaScript page errors**.

## Real public synthetic submission after the hotfix
- Opened the actual public Contact form with synthetic QA contact data; explicitly completed and consented for test purposes.
- Firestore WebChannel responded **HTTP 200**, visible success text **`Recibimos tu solicitud`**, receipt reference **`GP3JXT9BRB`**.
- This confirms **browser -> Firebase** durable capture in production. It does not prove delivery of a sales-email alert.
- Synthetic QA contacts are not sales opportunities and should be excluded from qualification/reporting.

## Grounded chat endpoint
- `POST https://lch-app.cloud/api/chat` from the public origin for Evidence AI returned a grounded answer and `suggestedInterest: LCH Evidence AI`, with three approved links.

## Release conclusion and outstanding business integration
- **Production transport and quality PASS**, including verified real Firestore persistence and consent.
- **No new public n8n webhook, no remote model, no DOM scraping, no automatic consent or form submission.**
- Microsoft 365/Outlook sales notifications remain a **separate uncompleted integration**; successful lead storage must not be described as a delivered notification.
- The slot interpreter is conservative, deterministic and schema-bound rather than a free-form generative model. The form allows review and human correction.

**Recommendation:** GH-22 production release gate PASS, close GH-22. Retain previous immutable releases for rollback.
