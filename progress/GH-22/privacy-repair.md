# GH-22 — Localized privacy repair and re-verification

## Finding

A user could provide only an out-of-contract private detail (e.g., a phone number or password). Before repair, no allowed Contact field would be extracted, so Donna would fall back to ordinary same-origin `/api/chat`. This did not write Firestore, but violated the contract's intended data-minimization boundary for contact preparation.

The Graph Harness recorded a privacy-critic failure against `gh22_semantic_quality` and set GH-22 back to `running`.

## Localized fix

- Added `containsOutOfSchemaPrivateData` to `src/contact/semanticDraft.ts` for conspicuous out-of-schema identifiers and secrets (telephone, DPI, passport, credential assignments, payment-card labels).
- `DonnaChat.send` now intercepts either allowed personal contact data **or** unsupported private contact data for local preparation, instead of forwarding it to the chat API.
- Unknown fields are not inserted into the approved `ContactDraft`, and the reply explicitly states they will not be used.
- A guided-field answer that includes out-of-contract private details is never treated as an organization name or project description.
- `safeContactMessageFromConversation` also prevents unsupported private data from becoming the submitted business message.

## Evidence (candidate runtime)

1. `npm run check`: **55/55** unit and integration tests PASS; TypeScript PASS; guarded production build PASS.
2. `node scripts/semantic-contact-smoke.cjs` against Node stage `http://127.0.0.1:4243/`: mobile (390px), desktop (1365px), full natural-language contact prefill, editable handoff, unchecked consent PASS.
3. Separate guided data entry: human edits retained, no Firestore/API POST PASS.
4. **Adversarial private data:** browser sends a phone-only message, sees the local contact helper, confirms zero `/api/chat` POST and zero Firestore POST; final form's `mensaje` remains empty, consent remains unchecked PASS.
5. `node scripts/donna-smoke.cjs` against same stage: mobile/desktop original API, products, handoff and keyboard navigation PASS; zero JS errors.
6. Guard without a production environment: executing `check-production-env.mjs` from a blank directory exited nonzero and reported all seven required Firebase config names (no secret values).

## Limits

The detection is bounded; it does not claim universal PII recognition or arbitrary-language parsing. It improves data minimization for common declarations, not a general-purpose sensitive-data classifier. The system still does not provide an outbound sales-email notification and does not activate a new generative model provider.

**Verifier conclusion:** PASS for the localized privacy repair. Production transport gate remains pending public HTTPS validation after the hotfix is merged and deployed.
