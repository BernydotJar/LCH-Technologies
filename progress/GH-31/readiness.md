# GH-31 — Domain cutover evidence and blockers

**Date:** 2026-10-18. **Execution:** Graph Harness SHIP. **Current node state:** PENDING; **release authorization for this change does not waive external verification**.

## Producer

- Repository baseline: `main` at `20128c533ad126132b947613f7092bf8d2468e4a`.
- Current production documentation: immutable Node 22 release under Supervisor, Cloudflare/public origin `lch-app.cloud`, Donna same-origin `/api/chat`, Firestore-first Contact, n8n private.
- Added explicit GH-31 dependency on completed GH-23 and GH-17, gated by `production_transport`.
- Implemented runtime-only allowlisted `LCH_CANONICAL_ORIGIN` to switch canonical/hreflang/OG/Twitter/JSON-LD in the Node response without changing the existing production default.
- Added unit coverage, a cutover runbook and independent read-only CI DNS/TLS gate.
- The initial Donna GH-24 code validation on the GH-31 branch passed: https://github.com/BernydotJar/LCH-Technologies/actions/runs/39172549932 ; further commits also passed at https://github.com/BernydotJar/LCH-Technologies/actions/runs/39172646752 .

## Critic / independent public transport check

Observed from an unprivileged GitHub Actions Ubuntu runner on 2026-10-18:
- Authoritative nameservers: `ns27.domaincontrol.com` and `ns28.domaincontrol.com` (GoDaddy DNS).
- A records at apex: `3.33.130.190` and `15.197.148.33`. **Do not assume either is the actual website upstream.**
- At least one MX record exists and must remain intact.
- `https://lch-technologies.com/health`, homepage and `https://www.lch-technologies.com/`: `ECONNRESET`; TLS/HTTP cannot be accepted.
- Existing `https://lch-app.cloud/health`: observed HTTP **530** from same runner, so the current public application ingress itself needs diagnosis before adding the new hostname.

Evidence: https://github.com/BernydotJar/LCH-Technologies/actions/runs/39172718555

## Blockers and release decision

**BLOCKED / NOT LIVE.** The domain's GoDaddy DNS is known, but no verified active Cloudflare zone/hostname mapping, working TLS, usable existing public origin or live browser E2E has been produced. Cloud Sandbox MCP / Chrome CDP currently returns `McpServerError: Session terminated`; this prevents the previously successful supervised-runtime and browser deployment workflow.

Do not change authoritative nameservers before exporting and preserving Microsoft 365 MX, SPF, DKIM, DMARC and autodiscover records. Do not merge or activate GH-31 just because repository CI passes.

## Next safe, unlocked actions

1. Reconnect the **existing** Cloud Sandbox MCP V2 bridge/workspace; do not create an unrelated workspace as a shortcut.
2. Recover exact supervisor `lch-site`, Cloudflare tunnel and backend `14175`; fix `lch-app.cloud/health` 530 first.
3. From GoDaddy/Cloudflare authenticated Chrome, confirm domain and email zone, add domain to correct hosting ingress, preserve mail, issue HTTPS edge cert.
4. Perform canonical switch only after new-domain canary is healthy, run browser Contact/Donna E2E, independent verifier and gate, and record append-only event chain/checkpoint with the pinned official Graph Harness.
5. Merge to main and record production release SHA after those gates. Keep rollback and old hostname healthy.
