# GH-23 — Independent adversarial CX and privacy review

Reviewer scope: `specs/GH-23/donna-conversation-cx.md`, product code and browser-level behavior. No third-party model evaluation is claimed.

## Source findings and localized repairs

1. **HIGH — history cross-context PII replay (fixed).** The previous chat implementation appended private local contact-guide turns to the same `messages` array that is later serialized into `POST /api/chat`. After `Volver al chat`, a normal product question could replay personal details and guided prompts. **Fix:** guided user+assistant turns now carry `private: true`; `safeKnowledgeHistory` strips private turns and obvious PII-laden text before serialization. Browser assertions inspect outgoing request **bodies**, not merely the number of requests. Regression PASS at 390px and 1365px.
2. **MEDIUM — multiple competing contact actions (fixed).** The existing assistant bubbles contained inline `#contacto` buttons and the sticky footer offered two large contact buttons. **Fix:** suppress inline contact links without suppressing product evidence links; one principal action `Preparar una solicitud` plus an understated direct-form alternative. In guided state, `Revisar formulario` becomes the single primary action.
3. **MEDIUM — first-turn friction and redundant instructions (fixed).** The contact assistant previously announced `Identifiqué 0 datos`, then repeated the missing question in the footer and transcript. **Fix:** natural introduction, incremental questions once in transcript and only progress/review hints in footer. Known interest inherited from public conversation can legitimately start at 1/6.
4. **MEDIUM — unknown-question sales redirect (fixed).** Deterministic engine redirected every unknown question to a contact link, despite no evidence on the topic. **Fix:** honest `clarify` response and allowlisted prompts for automation, AI and products; no new ungrounded knowledge claims or forced lead.
5. **MEDIUM — overbroad natural-language intent (fixed).** Initial direct-contact matching risked classifying `Quiero hablar de IA` as a request for a salesperson. **Fix:** require human/team recipient for `hablar`/`conversar`, distinguish explicit bookings from topical discussion, add negative tests.
6. **LOW — stale clarification state (fixed).** Global `clarifiedAlready` could poison later unrelated topics. **Fix:** inspect only the latest assistant response.
7. **CHECK — user authority (verified).** Complete form and direct bypass remain accessible; no auto-acceptance of `consentimiento`, no Firestore POST from chat. Original chat, semantic contact intake and new guided intent flow all passed in mobile and desktop browsers.

## Reviewer conclusion
**PASS for scoped GH-23 quality with explicit limitation:** This product uses deterministic source-approved knowledge and local slot interpretation; it does not have a general generative language model, and PII heuristics are bounded. Sales notifications to Microsoft 365 remain unconfigured.

The release still requires independent HTTPS transport and browser smoke after merge.
