# GH-25 - Four-recipient Microsoft 365 lead notifications

## User authorization
Send notifications for new LCH website contact form submissions to exactly:

1. contacto@lch-technologies.com
2. eduardo.sacahui@lch-technologies.com
3. lina.saldarriaga@lchtechnologies.onmicrosoft.com
4. sara.saldarriaga@lchtechnologies.onmicrosoft.com

These are four recipients on **one** Microsoft Graph mail message, not four sends. This scope does not authorize any unrelated recipients or marketing campaigns.

## As-built boundary
- The public form writes to `rag-municipalidades` / Firestore named DB `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7` / collection `demoRequests`.
- The UI has no permission or secret to send email. Public Firestore create requires human consent. Processing metadata is written by privileged backend only.
- The existing n8n workflow handles scoring, but currently no active email sender was found. Delivery must not depend on the local Cloud Sandbox uptime.

## Target
- Firebase Functions 2nd gen Firestore create event (named database, region `us-west1`).
- Validate consent and source, claim one lead with a Firestore transaction, send one Microsoft Graph HTML email to four specified addresses with Reply-To set to prospect email, and mark `notification.state=accepted` only after Graph HTTP 202.
- App credentials live only in Cloud Secret Manager, never `VITE_*`, Firebase client config, repo or logs.
- Human/admin configuration required for app-only `Mail.Send` and sender mailbox, scoped to `contacto@lch-technologies.com` using Exchange application RBAC rather than broad tenant-wide send capability.
- Multiple Eventarc deliveries are supported with a transaction/lease; transient errors retry, permanent authorization errors mark `blocked`, retry ceiling marks `needs_review`. At-least-once transport has a possible duplicate if Graph accepts a request but the process loses its acknowledgement; leadId accompanies every message to audit.

## Explicit gates
Quality: unit tests for recipients, HTML safety, consent, Graph token, Graph send, transaction, retry/blocked states and CI pass.
Production: secrets provisioned, Entra consent and constrained mailbox scope validated, function deployed successfully, new synthetic lead written to named database, Graph HTTP 202 logged, and **all four real mailboxes confirm receipt**. Only then claim email alerts are live.

## Confirmed pre-deploy blocker
Firebase dry-run failed while accessing Secret Manager with 403: billing disabled on rag-municipalidades. No function or credentials have been deployed. The production gate must remain blocked.

## Security clarification
Microsoft Entra tenant-wide `Mail.Send` application consent and Exchange Online mailbox-scoped Application RBAC permissions are additive, not intersected. Use only mailbox-scoped `Application Mail.Send` Exchange RBAC authorization, with **no** unscoped `Mail.Send` grant in Entra. Confirm authorized and unauthorized sender-resource tests before deploying.
