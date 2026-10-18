# LCH — lch-technologies.com production cutover

**Owner:** LCH release gate / Graph Harness GH-31. **State:** PREPARED, **NOT DEPLOYED**. Updated 2026-10-18.

## Current topology (do not replace with static-only hosting)

```text
https://lch-app.cloud (existing public service)
       -> existing Cloudflare HTTPS/tunnel
       -> supervised Node 22 process, port 14175 (private)
       -> dist/server.mjs: static React + same-origin POST /api/chat (Donna)
       -> browser Contact writes consented demoRequests to existing Firestore database
       -> existing private Firestore polling n8n, separate from website ingress
```

`https://lch-technologies.com` must become an **additional public hostname on the same verified application upstream**, then the canonical customer hostname after successful canary. Do not create a second standalone Vite or Firebase Hosting deployment that omits Donna. Never expose n8n or internal port 14175 publicly.

## Phase 1 — Identity and DNS/email preflight

- Confirm repository `BernydotJar/LCH-Technologies`, `main` release SHA, workspace and Graph Harness `GH-31`; use an immutable build with a rollback path.
- Identify the actual registrar, authoritative nameservers, Cloudflare account/zone, and live named tunnel. Do **not** assume `lch-technologies.com` is already in Cloudflare or owned by the `lch-app.cloud` zone.
- Export the *existing* DNS zone before any nameserver change: A, AAAA, CNAME, MX, SPF, DKIM, DMARC, Autodiscover, ownership verification and other active subdomains. Verify active Microsoft 365 email routing for `contacto@lch-technologies.com`. **No MX/TXT deletion or DNSSEC change without a verified transfer plan.**
- Use existing service/tunnel endpoint only after verifying its ID and route; no guessed IP, CNAME target or tunnel UUID.
- If Cloudflare full-zone onboarding is required, import and verify **all email DNS records first**, then adjust nameservers through the registrar; recheck MX/TXT and message delivery after propagation.
- Avoid CNAME-chaining to a proxied `lch-app.cloud` host across Cloudflare zones/accounts without checking provider support (can cause 1014). Prefer the actual named tunnel hostname / authorized custom-domain configuration.

## Phase 2 — Prepare application and immutable release

- Merge the verified GH-31 implementation only after CI and independent review. It defaults to `https://lch-app.cloud` and does not change existing production metadata until explicitly enabled.
- On the real deployment host, reuse the ignored production Firebase environment (seven `VITE_CONTACT_*` fields), leaving `VITE_N8N_WEBHOOK_URL` unset. Never place credentials in Git.
- Run `npm ci`, `npm run check`, `npm run build:deploy`; ensure **both** `dist/index.html` and `dist/server.mjs` exist.
- Stage an immutable versioned release, preserve last known healthy release and supervisor config. Do not set the new canonical origin yet.
- Add the new public hostname `lch-technologies.com` to the **existing** Cloudflare ingress and proxied DNS with cert issuance. Add `www` as a second hostname or redirect to apex. Keep the old route operational as rollback.
- Probe HTTPS/TLS, `/health` and `POST /api/chat` with the new browser origin and genuine Host forwarding. Check Firestore API-key referrer restrictions or other Firebase authorized domain settings, if in use.

## Phase 3 — Canary, canonical switch and release gate

Only **after** the new domain passes SSL and routing checks, point the existing Node supervisor release at the immutable candidate and set:

```text
LCH_CANONICAL_ORIGIN=https://lch-technologies.com
LCH_PUBLIC_ORIGIN=https://lch-technologies.com
```

No trailing path or query. `LCH_CANONICAL_ORIGIN` accepts only `https://lch-app.cloud` or `https://lch-technologies.com`; invalid values fail closed at startup.

Independent checks (capture status, certificate, DNS answers, build SHA and browser evidence):

```bash
dig +short NS lch-technologies.com
dig +short A lch-technologies.com
dig +short CNAME www.lch-technologies.com
dig +short MX lch-technologies.com
dig +short TXT lch-technologies.com
curl -fsS https://lch-technologies.com/health
curl -fsS https://lch-technologies.com/ | grep -E 'canonical|hreflang|og:url|og:image'
curl -fsSI https://lch-technologies.com/assets/social/lch-preview-original.png
curl -fsSI https://www.lch-technologies.com/
```

Additionally run a **browser E2E** on desktop and mobile: homepage loads, both language paths have matching canonical URLs, Donna answers a grounded `POST /api/chat`, an off-origin POST is rejected, and an explicit-consent synthetic Contact request receives a Firestore receipt in the **existing named database**. Verify the synthetic receipt and secure processing separately; an HTTP success alone is not proof of four-mailbox email delivery. Preserve no personal production data in test artifacts. Verify SSL chain (trusted, unexpired, covers apex and www), DNS propagation, and Microsoft 365 send/receive.

After canary PASS, use a **301 from the old website domain to the new apex** for public pages, while retaining a documented rollback route and ensuring supervisor health checks are not redirected unexpectedly. Confirm no redirect loops and no mismatch between asset URLs, canonical and hreflang values.

## Rollback / release control

If any DNS, TLS, Donna, Contact/Firestore or email gate fails: **do not declare GH-31 DONE**. Remove or disable only the new website hostname mapping, revert supervisor to the previous immutable release/configuration, set canonical origin back to `https://lch-app.cloud`, and confirm the previous `/health` and contact path. Preserve evidence and describe the blocker in the Graph Harness ledger. **Never delete or rotate DNS/email/credentials as a shortcut.**

## Postrelease

- Observe 24 hours of health, edge 5xx and Donna rate-limit behavior, Firestore lead intake and mail routing.
- Keep the existing n8n processor private. Do not activate a second Outlook notification executor.
- Record the exact SHA, dashboard evidence, DNS/TLS observations, 390px and 1365px browser results and independent verifier verdict under `progress/GH-31/`.
- Close `GH-31` only after external evidence satisfies `production_transport` and the append-only graph validates.
