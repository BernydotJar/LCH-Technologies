# GH-31 — Branded-domain production cutover (SHIP)

## Business objective

Make **https://lch-technologies.com** the canonical, customer-facing URL of the already released LCH Technologies site. Preserve https://lch-app.cloud as a verified rollback entry point until the new domain is proven healthy. Do not confuse a GitHub merge with deployment or DNS activation.

## Required acceptance

1. The apex domain and `www` have verified authoritative DNS, a valid trusted HTTPS certificate, correct redirect behavior and HTTP 200 at the customer entry point; no naked public n8n service.
2. The existing Node process serves the React bundle **and** `POST /api/chat` for Donna. Do not substitute static-only hosting. `/health` must expose the exact immutable deployed release SHA.
3. All canonical, hreflang, Open Graph, Twitter and Organization JSON-LD URLs emitted by the live server use `https://lch-technologies.com`; English/Portuguese URLs are coherent.
4. The contact form creates a real consented synthetic lead in the existing named Firestore database, and the server still blocks unapproved public n8n webhook configuration. A Firestore receipt does not prove Outlook email delivery.
5. Preserve Microsoft 365 MX, SPF, DKIM, DMARC, Autodiscover and verification records before touching nameservers. Email send/receive must not regress.
6. Confirm the Cloudflare edge/backend mapping through the actual existing named tunnel and supervisor runtime, not an inferred CNAME to another proxied zone. Do not expose port 14175 or n8n port 5678.
7. Keep complete rollback instructions and a pre-cutover snapshot of DNS, tunnel routing, supervisor config and prior immutable release.
8. Graph Harness Producer → Critic → Fixer → Independent Verifier → release gate `production_transport` with live evidence. Human approval is gated and must remain auditable.

## Explicit non-goals

No registrar/domain transfer unless separately authorized; no change to Firebase billing, Firestore policy, n8n topology, M365 permissions or public webhook exposure; no claim of live generative Donna (the grounded deterministic runtime stays as built).

## Current external preconditions (2026-10-18)

- Existing documented public release: `https://lch-app.cloud`.
- Domain management and browser bridge are not currently accessible from this session: Cloud Sandbox MCP reports `Session terminated`.
- External HTTP probes of the requested domain were inconclusive. No current DNS zone, nameserver or certificate status is established.
- Therefore **live domain activation, runtime E2E and the GH-31 release gate must remain BLOCKED until independently observed**, regardless of CI outcome.
