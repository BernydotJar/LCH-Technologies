# GH-23 — Donna Conversation Experience Refinement

## User-facing defect
The current browser experience can say "Todavía no tengo información verificada..." and then show a contact link, a second "Completar mis datos" CTA, a "Continuar con una persona" CTA and a new guided message that identifies "0 datos". This is confusing and visually over-prompts the user.

## Product objective
Make Donna intentional and conversational, not just a knowledge lookup plus sales form. Keep LCH knowledge grounding, provenance and the form consent boundary.

## Scope
1. **Intent-aware transitions**: explicit "quiero hablar/agendar/contactar" requests immediately open the guided contact state locally, without a detour through an irrelevant server fallback. Generic product questions continue to /api/chat. Pricing/unknown questions should not silently trigger sales capture.
2. **One primary action at a time**: the welcome surface offers a single contact initiation link; explored responses show a single clear "Preparar solicitud" CTA. Remove duplicated inline contact links and the second stacked footer CTA. A non-competing plain text bypass to Contact remains available for users preferring the full form.
3. **Natural guided copy**: first question "¿Cuál es tu nombre?" without a "0 datos" announcement; progress appears only once meaningful information exists, and the same question is not repeated in both transcript and fixed footer. Shorter invalid-input and completion messages.
4. **Relevant clarification**: unknown requests receive a candid, non-pushy clarification with approved topic chips; no fabricated answers or default redirect-to-sales. Known boundaries (pricing, accounts and certifications) still apply.
5. **Privacy in returning to exploration**: guided contact turns are explicitly private/local. The outgoing /api/chat history omits **all** private turns and obvious PII-laden messages; no accidental replay after "Volver al chat", reset or failed request. Test the network payload, not just counts.
6. **Accessible/multidevice presentation**: keep keyboard Escape, reduced motion, hover pause, focus order, responsive width, visible form review CTA, no unexpected auto-submit. Optional quick actions cannot silently send data.
7. **Regression**: real Firestore submission remains explicit and operational; no changes to Firestore schema, authentication, cloud deployment target, or public n8n notification.

## Execution graph
Producer -> CX Critic -> Fixer -> Independent Verifier -> Quality Gate -> Production Gate -> Evidence.

## Pass criteria
- Typed routing tests for direct contact, generic questions, fallbacks, privacy and pricing.
- Two contact buttons and inline contact-link duplication reduced to one principal visible CTA per state.
- Browser scenarios (390px and 1365px): unknown -> suggested knowledge topic, direct contact -> one guided question, PII -> guided data -> back -> general chat with no PII in request body; form consent unchecked and no Firestore writes during chat.
- npm run check and build:deploy (validated Firebase configuration), public health/chat/form smoke after immutable deployment, rollback snapshot.
- GH-23 graph chain valid; any failure recorded before repair; independent verifier evidence and two scoped gates.
