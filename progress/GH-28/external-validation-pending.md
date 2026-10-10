# GH-28 | External delivery gate — NOT EXECUTED

**Release verdict:** BLOCKED. No email integration has been activated.

Exact confirmed blockers from the read-only runtime preflight:

- `activation_time_not_configured`: deliberate invalid placeholder prevents retrospective lead emails.
- `google_firestore_credential_not_bound`: no scoped Google service-account credential exists in the chosen n8n.
- `outlook_credential_not_bound`: no Microsoft Outlook OAuth2 credential exists in the chosen n8n.
- `workflow_not_active`: LCH workflow remains disabled, preserving Lina and avoiding emails.

Additionally, a single execution host has not been chosen between Mac n8n (`localhost:5678` in Chrome; no LCH workflow imported) and Cloud Sandbox n8n (`127.0.0.1:5678` in isolated workstation; GH-28 imported inactive). The Cloud Sandbox keeper does not supervise Mac host n8n.

The actual Microsoft OAuth2 n8n form was inspected via explicitly approved Chrome Computer Use. It requests a Client ID and Client Secret and advertises its own callback `http://localhost:5678/rest/oauth2-credential/callback`. No values were entered, no credential saved, and the delegated Computer Use session was revoked after inspection.

**Do not call GH-28 DONE** without four real recipient receipts. Tests are mocks/synthetic fixtures only and cannot substitute for mailbox verification.
