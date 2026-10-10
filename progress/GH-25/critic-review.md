# GH-25 | Product and security critic

## Findings and changes

1. **HIGH (address exposure, avoided).** The existing website saves directly to Firestore from public React. Embedding Graph client credentials or directly invoking an email webhook from the browser would expose them to all visitors. GH-25 uses an isolated server-side Firebase Functions v2 Firestore creation trigger with Google Cloud Secret Manager only. No mail tokens, API keys or recipient override fields are added to Vite or public Contact HTML.
2. **HIGH (excessive Microsoft privilege, deployment blocker).** App-only Graph Mail.Send can send as any mailbox if administered without a scope. Require admin-approved **Exchange application RBAC limited to the sender mailbox**. Do not deploy with unrestricted permission. Confirm that `contacto@lch-technologies.com` exists in Exchange and can be an app-only sender.
3. **HIGH (infra blocker, reproduced).** Firebase CLI dry-run reached Secret Manager but was blocked by **HTTP 403 billing required** for project `rag-municipalidades`. The named Firestore Enterprise database is `us-west1`. No notification function has been deployed, and no email delivery is claimed.
4. **MEDIUM (duplicate events, mitigated).** Eventarc is at-least-once. A Firestore transaction claims a lead and a time-limited lease prevents concurrent duplicate delivery. Each accepted lead records a stable reference and Microsoft Graph message header. A crash between Graph HTTP 202 and Firestore status update can still produce a duplicate on retry; do not claim exactly-once email.
5. **MEDIUM (false delivery assertions, avoided).** Graph HTTP 202 means accepted by Microsoft, not delivered to inboxes. `notification.state=accepted` is therefore not proof of receipt. Production gate requires independent mailbox receipt/Exchange trace for all four addresses.
6. **MEDIUM (PII injection, mitigated).** Lead message and company values are length-bounded and escaped in HTML; arbitrary visitor-supplied recipients are rejected. User consent and website source are validated before any Graph call.
7. **MEDIUM (reliability, addressed).** 429, 408, 5xx and network timeouts trigger retries; 400/401/403 are blocked for admin attention, and seven attempts is the ceiling. Failures do not erase the Firestore record or affect the existing n8n scoring fields.

## Verdict
**PASS for scoped source quality**, conditional on CI and independent testing. **Production email delivery NOT PASS**: billing disabled, Entra/Exchange authorization and secrets absent, real recipient delivery unverified.
