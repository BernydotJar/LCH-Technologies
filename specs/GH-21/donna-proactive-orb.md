# GH-21 | Donna Signal Orb + Bounded Proactive Ideas

## Product objective
Make Donna inside LCH more recognizable and helpful **before users know what to ask**. Deliver two restrained surface-level enhancements without changing the existing conversation/Firestore authority boundaries.

## Explicit scope (product-only)
1. **Signal identity:** replace the current static D badge with a layered blue/teal signal orb, compact in the launcher and header. State changes: idle, hover, shaping (request pending), responding (reply received). Animations use opacity/transform only; the orb becomes static for `prefers-reduced-motion: reduce`.
2. **Rotating ideas:** a finite allowlisted series of business-oriented prompts (operations, documents, learning, software) cycles in the closed invitation and the idle chat. The prompt is user-activated, never auto-sent.
3. **Contextual next actions:** after grounded replies, show one or two verified related follow-up prompts. Handoffs/unknown/pricing should not introduce fabricated facts or force a sales action.
4. **Accessibility:** focus and hover pause automatic rotation; typing pauses it; hidden tabs pause it; reduced motion freezes the initial idea, but manual "next" remains available. Keep the accessible launcher label stable; never place rotating copy in a live region.
5. **Usability:** smooth stable-height transitions, deliberate contrast, mobile viewport (390px) and desktop (1365px), Escape and existing form handoff remain functional.

## Authority boundaries
- Source of all new hints/follow-ups is a LCH-owned experience configuration, not inferred from user text or generative output.
- The server `POST /api/chat`, knowledge provenance, approved links and lead schema remain unchanged.
- No implied live AI inference, automatic CRM writes, booking confirmations or invented ROI/pricing guarantees.

## Product verification targets
- Orb visually distinct in launcher and chat header; states and reduced-motion behavior observable.
- Ideas cycle at most every ~6s while idle and stop while focused/hovered/typing/hidden.
- Manual next idea works even when reduced motion is enabled.
- Clickable hints call the existing grounded chat API exactly once.
- Contextual followups stay tied to LCH knowledge and only appear for supported answer kinds.
- No regression in existing 39 tests, build, check, basic security, mobile/desktop UI, and deployed HTTPS health.
- Independent critic detects no ungrounded claims, distracting motion, keyboard traps or focus theft.

## Execution graph
`Producer -> Product/CX Critic -> Fixer -> Independent Verifier -> Release Gate -> Evidence`.
Production cutover only after both quality and transport evidence satisfy GH-21's gates.
