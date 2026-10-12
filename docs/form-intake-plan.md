# LCH | Contact Intake V2 — Architecture and Release Evidence

## Purpose
Convert the corporate contact CTA into a commercially useful qualification experience while preserving the versioned Firestore lead contract and the private n8n processor.

## Cadre AI benchmark (reviewed 2026-10-09)
Cadre AI frames its contact experience around an AI strategist, business outcomes, a short set of contact details, and the business challenge to address. LCH adopts the business-outcome framing, not Cadre copy or site design. Reference: https://cadre.ai/contact

## Implementation
- Three optional quick-start choices map to existing contract values: `Automatización`, `Inteligencia Artificial`, `Software Empresarial`.
- All six existing interest values remain valid. No Firestore schema/rules migration was needed.
- Mandatory fields: given name, family name, email, organization, role, interest, consent. The message is optional.
- Business-oriented field guidance, autocomplete, backend-aligned character limits, and single-column mobile layout.
- Duplicate-submit protection, loading/error/confirmation states, and durable Firestore document receipt.
- Basic honeypot for accidental automated submissions, not a substitute for server-side abuse controls.
- Explicit contact-purpose consent and a linked short privacy notice. A comprehensive legal privacy policy remains a separate governance deliverable.
- Corrected the CTA wording: submitting the form **requests a conversation**; it does **not** reserve a calendar slot.
- Removed the fake footer legal links (`href="#"`).

## Existing production architecture preserved

```text
Public website contact form
    -> Firebase Web SDK (public client config)
    -> Firestore named database: demoRequests (create only under strict rules)
    -> Private n8n scheduled processor (no public ingress)
    -> HOT / WARM / LOW score, queue metadata, status processed
```

Important: the current exported n8n processor scores and updates documents. It **does not send an email, Slack, or Teams notification** by itself. A commercial destination and authenticated delivery channel must be configured before declaring sales notifications operational.

## Root cause discovered
The earlier public static website bundle matched a build produced with no `VITE_CONTACT_*` values. Firebase configuration is compiled into the lazy submission chunk at **build time**, not supplied to the static Node server at request time. The visible UI could therefore fail on its first submission despite the previously verified AI Studio/Firestore workflow.

## Repair / immutable-release gate
- The seven Firebase public SDK values were retrieved from the existing Firebase Web App; the Firestore database ID was read from the existing project's named database.
- Values reside only in the ignored local `.env.production.local`; **do not commit this file**.
- `npm run build:deploy` verifies all seven values before running Vite.
- The deployment guard also rejects a browser-facing `VITE_N8N_WEBHOOK_URL`; keep n8n as a private Firestore consumer.
- Treat `npm run build` as a development/build-integrity check only; it does not guarantee production contact configuration.

## Verification evidence
- Existing lead, n8n, and Firestore processor tests: 20/20 passing.
- TypeScript: PASS. Production build: PASS. `git diff --check`: PASS.
- Playwright UI smoke on local Vite dev: PASS (quick interest choice, payload shape, simulated receipt, zero browser errors).
- Browser smoke at 390px: **no horizontally overflowing elements within #contacto**. Other site sections still cause page-wide overflow and should be assessed separately.
- Production-configured local Vite preview: a synthetic submission returned a real Firestore document receipt and showed the user confirmation. Only a synthetic test identity was used. This created one QA record in the live Firestore collection for later cleanup.
- Public-site cutover: only mark PASS after `/health`, new form markup, and production API configuration are verified.

## Release checklist
1. Ensure `.env.production.local` exists on the release machine and is ignored by Git.
2. Run `npm run check` and `npm run build:deploy`.
3. Verify the compiled `demoRequests-*.js` hash differs from a build with blank Firebase configuration.
4. Stage `dist/` as an immutable release; preserve the previous release for rollback.
5. Activate via the existing supervised server, then check public HTTPS, `/health`, and the contact form on mobile and desktop.
6. Validate an actual non-personal QA submission **once** (avoid duplicate CRM/test records).
7. Independently verify the private n8n processor sees and processes the QA request; add notification delivery only after its destination and credentials are agreed.

## Follow-up risk gates
- **P1:** Configure an authenticated notification route and commercial destination, with retry/idempotency and delivery-state metadata.
- **P1:** Review and publish a formal privacy policy covering controller/contact, retention, user rights, and processors before scale-up.
- **P1:** Add Firebase App Check and abuse controls/rate limiting for public writes before paid acquisition.
- **P2:** Attribute conversion events without shipping PII to third-party analytics.
- **P2:** Extend optional qualification to product-specific demos (I-DO, LUMA, Evidence AI) after the Firestore/n8n schema is migrated.
