# Donna GH-23 — Conversational CX refinement

## Product outcome

Donna now separates **exploration** from **contact preparation**. Questions about LCH services and products use its existing grounded same-origin `/api/chat`; an explicit request to be contacted begins the local guided form flow; and unrecognized questions surface grounded exploration choices rather than an abrupt sales redirect.

This is a targeted UX/flow enhancement on top of the GH-22 semantic contact integration, not an LLM-provider change or redesign of LCH.

## Contract and flow

```text
Visitor → Donna
  ├─ Business or product question → POST /api/chat → grounded LCH facts + curated suggestions
  ├─ Unknown question → honest clarification + vetted topic chips (no forced contact)
  ├─ Price / certification / account boundary → accurate limitation + optional contact CTA
  ├─ Explicit "quiero hablar con el equipo" → local contact guide (no API POST)
  └─ Voluntarily supplied personal contact data → local form draft (no API POST)
                                     │
                            Guided slot questions
                                     │
                     Review in Contact → human consent → human submit
                                     │
                         Existing Firestore demoRequests
```

**Single primary CTA:** in exploration, the footer displays `Preparar una solicitud` plus an understated text option to open the full form directly; prior inline `#contacto` sales buttons and the competing secondary footer button are removed. In guided mode, the primary action is `Revisar formulario`, with an understated `Volver a explorar` link. Nothing is submitted by Donna itself.

**Copy refinements:** no `Identifiqué 0 datos` introduction, no duplicated missing-field question in both transcript and sticky footer, and clearer wording about review and consent. A business topic already discussed can prefill the interest field, so progress may correctly start at `1/6 datos` rather than `Empecemos`.

## Privacy boundary

Client-side history turns have an optional `private` marker. Guided answers and local assistant prompts are private. Before every normal chat request, `safeKnowledgeHistory()` drops all marked turns **and** obvious contact-identity/sensitive disclosures, then extracts role/content only. This prevents retroactive replay of draft contact details after the visitor presses `Volver a explorar`, including when retrying a failed chat response.

This is bounded prevention, not a claim of universal PII recognition. Users are instructed not to share secrets. The approved tool schema still excludes `consentimiento`, arbitrary DOM fields and submission authority.

## Intent routing

`isDirectContactIntent` recognizes requests to talk to the team, arrange a meeting, request a quotation or prepare the form. A user merely saying `Quiero hablar de IA`, asking how LUMA works or asking what it costs does **not** silently enter contact mode. The business knowledge response preserves the deterministic source allowlist.

`respondToDonna` now returns a grounded `clarify` response for unknown questions with approved topics (automation, AI, products) instead of an automatic contact redirect. Pricing, private-account and certification boundaries remain candid and do not invent prices or guarantees.

## Regression and rollback

1. Run `npm run test`, `npm run typecheck`, `npm run build:deploy` with the ignored production Firebase config.
2. Verify `/health`, `/api/chat`, GH-23 E2E on 390px and 1365px, GH-22 semantic intake and Donna baseline browser suites.
3. Stage the immutable release with its `dist/server.mjs`; preserve supervisor config and old release for rollback.
4. After a merge, validate public HTTPS and a synthetic Firestore receipt only if needed to verify persistence was not affected (GH-23 makes no Firestore schema or submit-code changes).

## Explicit limitations

- Donna continues to use **deterministic grounded knowledge and local guided slots**, not generative LLM conversation.
- Exact free-form understanding depends on curated phrases and field rules; unknown queries are handled honestly rather than answered speculatively.
- Microsoft 365 sales notification remains separate and unconfigured as part of GH-23.
