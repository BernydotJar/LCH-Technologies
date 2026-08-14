# GH-19 — Durable lead capture with n8n follow-up automation

## Objective
Extend the existing LCH demo-request form so every accepted submission is durably stored before any automation is attempted, while n8n receives a best-effort notification for lead qualification and follow-up.

## Functional acceptance criteria
1. Preserve the current form fields and user experience.
2. A successful Firestore persistence is the source of truth for form success.
3. After persistence, send n8n a JSON payload containing the Firestore `leadId`, normalized form fields, `source: website`, and an automation schema version.
4. n8n unavailability, timeout, or non-2xx response must not turn a durably persisted lead into a user-visible submission failure.
5. The n8n webhook URL is configuration, not hard-coded application state.
6. Provide an importable n8n workflow named `LCH Website — Lead Intake` with a stable POST webhook path, validation/normalization, deterministic lead scoring, priority routing, and a machine-readable response.
7. Firestore public create rules must be narrowed to the expected lead schema, required consent, field types, field lengths, fixed `source/status`, and server timestamp semantics; public read/update/delete stay denied.
8. Do not embed privileged credentials in browser code or workflow JSON.

## Lead scoring baseline
Deterministic scoring precedes any AI enrichment:
- corporate-looking email domain: positive signal;
- senior/decision-maker role keywords: positive signal;
- strategic interest areas (AI, Automation, Evidence AI, Enterprise Software): positive signal;
- non-empty operational challenge/message: positive signal;
- classify as `HOT`, `WARM`, or `LOW` with explicit score/reasons.

## Reliability requirements
- Firestore write happens before webhook notification.
- Webhook notification has a bounded timeout.
- Automation result is observable in browser logs/return metadata but does not erase a persisted lead.
- Duplicate workflow execution should be safe to reason about using `leadId` as the stable idempotency key for downstream integrations.

## Security requirements
- No public Firestore reads.
- Strict create schema validation.
- No workflow credentials exported.
- Public transport/rate limiting and stable HTTPS exposure are deferred to GH-20 and remain release-blocking.

## Verification
- TypeScript typecheck.
- Production Vite build.
- Unit/contract tests for normalization, validation, scoring, and best-effort webhook behavior.
- Import workflow into the authenticated local n8n instance and execute representative webhook tests from the sandbox.
- Independent review confirms a persisted lead is not lost when automation is unavailable.

## Non-goals
- Production Cloudflare/Firebase endpoint exposure (GH-20).
- CRM vendor selection.
- Gmail/Calendar OAuth setup.
- Production deployment approval (GH-17).
