# GH-20 Critic / Red Team Review

## Findings

### F1 — Quick Tunnel exposes n8n UI — FAIL
Temporary Cloudflare transport successfully carries the LCH browser request to the live webhook, but the same public hostname exposes the n8n web application/login at `/`. The admin REST API correctly returns 401 anonymously, but publishing the editor surface violates the GH-20 isolation requirement.

### F2 — No usable LCH production DNS zone — BLOCKED
Independent DNS-over-HTTPS probes through both Cloudflare and Google return DNS status 3 (NXDOMAIN) for `lch-technologies.com` and `www.lch-technologies.com`. A stable hostname under that domain cannot be routed until the domain/zone exists and is delegated.

### F3 — Cloudflare Named Tunnel authorization requires external account login — BLOCKED
`cloudflared tunnel login` reaches Cloudflare Dashboard, but the current browser profile is not authenticated to Cloudflare. No account identity or credentials will be selected or collected by the harness.

### F4 — Browser-to-webhook is not the strongest architecture — FAIL
Because Firestore is already the durable source of truth, a public n8n webhook is unnecessary for reliability. n8n ships a native Google Cloud Firestore node. A scheduled private workflow can query pending `demoRequests`, process them, and update automation state using a server-side Google credential. This removes public n8n ingress entirely and makes transient automation downtime naturally recoverable.

### F5 — Firestore production rules remain unverified — BLOCKED
The hardened repository rules have not been proven deployed to the live Firebase project. Production release cannot claim abuse hardening until live rules are verified/deployed.

## Verdict
REPAIR REQUIRED. Prefer private Firestore polling over exposing n8n. If a public webhook remains desired later, require a real Cloudflare zone plus a path-limited/Worker gateway and Access protection.
