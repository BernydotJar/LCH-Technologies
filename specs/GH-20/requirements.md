# GH-20 — Private production automation transport and validation

## Objective
Run LCH lead automation in production without exposing the n8n editor or requiring a public n8n ingress. Firestore remains the durable source of truth; n8n consumes pending leads privately using an authorized Google Cloud Firestore credential.

## Required outcomes
1. The website persists every accepted lead with `automationStatus: pending` before automation is attempted.
2. A private scheduled n8n workflow queries only pending `demoRequests` and processes them without any inbound webhook requirement.
3. The n8n editor/admin remains local/private; no production Quick Tunnel is accepted.
4. Browser/client secrets are not used as security controls and no privileged Google credential is exported to Git.
5. Processed leads receive automation metadata using document-specific updates while preserving the original lead record.
6. The private processor uses the same deterministic HOT/WARM/LOW scoring baseline as the tested webhook flow.
7. n8n downtime is non-destructive: pending Firestore documents remain available for a later scheduled run.
8. Production Firestore rules are verified as deployed before release; repository rules alone are not evidence of live hardening.
9. A real n8n Google Cloud Firestore credential is assigned and the private workflow is executed against the intended project before release.
10. The public AI Studio site is synchronized with the Firestore `automationStatus: pending` write contract before final deployment.

## Optional Cloudflare architecture
Cloudflare remains an acceptable future ingress for other workflows only after LCH has an active Cloudflare-managed domain/zone. If used, a Named Tunnel or gateway must prevent anonymous access to n8n editor/admin surfaces and provide abuse controls. Quick Tunnels are verification-only.

## Release evidence
- Repository test/typecheck/build/audit evidence.
- Private processor workflow schema and scorer-parity evidence.
- Real n8n execution using an authorized Firestore credential.
- Proof no public n8n ingress is required for production lead processing.
- Live Firestore rules verification.
- Public form end-to-end persistence followed by n8n processing.
- Independent verification.
