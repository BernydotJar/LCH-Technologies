# GH-22 | Independent Product & Security Critic Review

Scope: `specs/GH-22/semantic-contact.md`, no new LLM/provider integration.

## Findings and repairs
1. **HIGH (production incident, fixed):** The public form's lazy submission chunk threw `Missing contact integration configuration: projectId` before reaching Firestore. Evidence: live Playwright page error on production, and no Firebase request. A Firebase-configured immutable rebuild from the exact current commit was activated. Repeated production synthetic submission produced a receipt and Firestore HTTP 200. Prevention: `npm run build` now runs `check-production-env.mjs` **before** Vite. `build:deploy` routes through the guarded build.
2. **MEDIUM (source review, fixed):** A semantic handoff can accidentally duplicate PII in the free-form business need if the visitor gives personal details in a single sentence (e.g. `Soy Ana Perez`), or a need followed by a telephone number. Fix: `safeContactMessageFromConversation` removes identity-only messages and strips contact information after stated business objectives. Regression tests added.
3. **MEDIUM (source review, fixed):** Role terms at the start of a clause could be captured too narrowly (e.g. `Directora` instead of `Directora de operaciones`) or misread as a person's name. Fix: bounded role capture and a non-person stoplist. Tests cover two Spanish contact scenarios and negative role/name cases.
4. **MEDIUM (mitigated by architecture):** A model/tool could attempt to set consent or add arbitrary fields. Contract only accepts seven exact existing fields, normalizes lengths, rejects unknown keys, and excludes `consentimiento`, `telefono` and submission operations. On handoff, human-written nonempty values take priority; the checkbox stays human-controlled.
5. **LOW (product limitation, accepted):** Deterministic slot extraction is intentionally conservative for ambiguous names, multiple interests and mixed-language inputs. The form always allows corrections; unknown values remain blank, and guided mode asks for them instead of guessing. An actual generative model is not claimed.
6. **OUTSIDE SCOPE:** Microsoft 365 sales notifications are still absent in the existing private n8n processor; successful Firestore persistence does not prove notification delivery.

## Adversarial boundary checks
- Chat-guided PII is handled in local React state; browser E2E showed **zero** `/api/chat` POST and **zero** Firestore POST during both one-sentence and guided contact collection.
- Existing Donna business-chat endpoint remains functional; baseline E2E passed.
- Tool metadata is declarative and no DOM selectors are used by the assistant.
- User must explicitly use the Contact submit button after reviewing and ticking consent.
- No credentials were committed; `.env.production.local` remains ignored.

**Critic recommendation:** PASS for GH-22 scoped implementation and guarded release with public verification required after merge.

## GH-22 revision 1 — additional privacy finding

**MEDIUM, reproduced by source control-flow inspection:** A phone-only or credential-only contact utterance matched no approved lead field and previously fell through to the same-origin chat endpoint. The Graph Harness invalidated the first quality pass, recorded this issue and returned GH-22 to the fixer. The localized guard and adversarial test now keep explicit unsupported private details local, omit them from the lead payload, and provide a transparent explanation. See `privacy-repair.md`. This is bounded detection, not a universal PII classifier.
