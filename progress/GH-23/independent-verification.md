# GH-23 — Independent verifier note

## Verified via browser and direct API inspection
- The test suite uses an actual Chromium browser, a real Node same-origin `/api/chat` endpoint, and a compiled Vite bundle.
- Unknown question → verified topic suggestions → grounded answer, with no forced form transition.
- A known subject can prefill only a relevant interest field, without inventing name, email, company or job.
- Direct contact intent → one guided name question; no generic unknown fallback, no network transfer and no auto-submit.
- Local guided name → return to exploration → normal product question: observed API request bodies contain no `Ana Perez` or local assistant question.
- Pricing question yields a stated limitation; optional direct-form route remains possible without marking consent.
- On 390px/1365px the panel is within viewport and shows no JS runtime errors.
- All previously verified Donna chat, product, semantic form and human-consent flows continue to pass.

## Independence
This review is based on policy invariants, source inspection and actual browser network payload assertions, not on a self-reported UI status or fabricated Granite evaluation.

## Limitations
- No new LLM introduced. Free-form understanding remains grounded/deterministic.
- PII protection covers explicitly marked contact-guide turns plus bounded heuristics; it is not a universal data-loss-prevention system.
- Microsoft 365 notification delivery not part of GH-23.

**Recommendation:** quality gate PASS for GH-23; production gate pending post-deployment checks.
