# GH-32 — Problem-first LCH commercial landing

## Product rationale

The current LCH website presents technical capabilities but asks visitors to work out which capability solves their business problem. This release improves *discovery before contact* and reuses the existing platform, brand, Firestore contract, Donna and products. It is deliberately separate from GH-31 DNS/domain activation.

## Scope and acceptance

- Hero communicates a clear operational outcome without fabricated ROI, testimonials, delivery guarantees or an unverified case study.
- Four selectable business challenges: manual workflows, applied AI, disconnected business systems and controlled cloud growth. Selection updates a contextual problem/approach/result panel without network traffic, analytics without consent or automated user data collection.
- User can explore the relevant existing site section, open the existing grounded Donna chat or open the existing Contact form with only an explicitly selected whitelisted interest. The form retains all required fields and unchecked consent; no lead is sent until the user completes it.
- Selecting a challenge optionally emits only its four-value ID through existing consent-gated GA4; no visitor text or PII is captured.
- All new text is localized in Spanish, English and Portuguese, keyboard accessible with visible focus/pressed state and reduced-motion support; mobile 390px and desktop 1365px have no horizontal overflow.
- Existing Donna, light/dark mode, contact edits and consent gating, public Firebase SDK build guard, route URLs and SEO remain intact.
- CI runs native Node tests, typecheck, guarded build, Playwright viewport E2Es, Donna form and night-mode regressions. Evidence includes screenshots (synthetic-data build only) and optional production smoke.
- Public release is targeted at the existing healthy Node/Cloudflare host `https://lch-app.cloud` with an immutable server+frontend bundle and rollback snapshot; no DNS, nameserver, Microsoft 365 or n8n changes.
- Graph Harness GH-32 follows Producer -> Critic -> Fixer -> Independent Verifier -> implementation_quality and production_transport gates -> Persistent Evidence.

## Explicit exclusions

This is not a new LLM agent. Donna continues as a bounded grounded assistant; no conversation is automatically submitted or forwarded. GH-31 remains responsible for `lch-technologies.com` GoDaddy/Cloudflare cutover and TLS/redirect acceptance.
