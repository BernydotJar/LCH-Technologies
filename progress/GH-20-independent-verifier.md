# GH-20 Independent Verifier — Revision 1

## Verified PASS
- The previous Quick Tunnel carried a real cross-origin request from the LCH `ais-pre` page to the live n8n workflow and returned HTTP 202/HOT/score 10.
- Red-team inspection also proved the Quick Tunnel exposed the n8n web application root, so it was correctly rejected for production.
- The temporary tunnel has been stopped; n8n remains healthy on the local Mac endpoint.
- Cloudflare and Google DNS-over-HTTPS both returned status 3 (NXDOMAIN) for the proposed `lch-technologies.com` host, so no production hostname under that domain is currently available.
- The repaired architecture needs no public n8n ingress: browser -> Firestore, then private scheduled n8n -> Firestore.
- The private processor exports no Google credential or actual Firebase project/database identifier.

## Blocking external validation
1. A real Google Cloud Firestore credential has not yet been assigned to the private n8n workflow.
2. The private workflow has therefore not executed against the intended Firestore project.
3. The hardened Firestore rules have not been verified/deployed in the live project.
4. The public AI Studio application still uses the previous create schema until the new `automationStatus: pending` contract is synchronized and rebuilt.
5. Chrome remote debugging port 9222 is currently unavailable, preventing the harness from safely using the user's authenticated n8n/Google UI session to complete those steps.

Result: BLOCKED on external authorization/deployment, not on repository implementation.
