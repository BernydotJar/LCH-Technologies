# GH-25 Spark Worker — verifier evidence

## Source, tests and static policy
- `npm run check` in `workers/lch-lead-mail`: **26/26 PASS** after CAS error-path and full integration tests.
- Tests cover fixed four To recipients and sender, strict consent/source/interest, HTML escaping, prospect Reply-To, immutable lead id, Google OAuth RS256 JWT verified against a generated RSA key, scope `https://www.googleapis.com/auth/datastore`, exact project match, Microsoft Graph client_credentials, token errors, HTTP 202 acceptance, HTTP 403/429/503 behavior and fail-closed secrets.
- Firestore wire integration: query in named database, required launch timestamp, descending 40-item page, REST JSON decoding, optimistic updateTime/notification-only PATCH, canonical FAILED_PRECONDITION conflict detection. Simulated full run: query → CAS claim → Graph sendMail → Firestore acknowledgement → second Cron does not resend.
- Fault injection: no consent, non-website contacts, expired/active leases, concurrency conflict, transient retry and permanent block, seven-attempt ceiling, 6-attempt per-Cron cap, wrong project/database, missing config, no public HTTP endpoint.
- `npm run build:check`: Wrangler 4.149.0 dry-run bundle **PASS** (21.59 KiB upload / 6.86 KiB compressed at first successful build), with only non-secret Firestore project/database bindings listed. No remote deploy invoked.
- `npm audit --omit=dev`: zero reported vulnerabilities.

## Workerd local runtime
- Local `wrangler dev --local --test-scheduled` responded `GET /` **404** (no public API route).
- `GET /cdn-cgi/local/scheduled?cron=*/5+*+*+*+*` returned **HTTP 200**, exercising the scheduled handler with no secrets; fail-closed preflight made no Firestore or Graph call.
- Wrangler account check: **not authenticated**. Cloudflare Dashboard is open in the browser but the isolated workstation does not have authorized Wrangler OAuth/API credentials. No account/token bypass attempted.

## Unverified external integration
- No Google service account secret has been created or configured in Cloudflare.
- No Microsoft Entra application client-credentials secret nor sender-only Exchange Application RBAC assignment has been configured through this scope.
- No Worker deployed to Cloudflare; no real Firestore collection read or Microsoft Graph send in GH-25.
- Production gate requires a secured Worker deployment under Workers Free, real lead after activation, Graph 202 and confirmed delivery in all four actual mailboxes. Site remains on Spark and unchanged.

- Repository `firestore.rules` enforces an exact allowlisted create shape with mandatory consent and `source=website`; it **does not** allow browser read/update/delete. The Worker runs with a dedicated IAM identity and bypasses client rules. This is a source review, not independent proof that the deployed rules are byte-for-byte identical.
