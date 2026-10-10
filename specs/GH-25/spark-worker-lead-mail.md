# GH-25 — LCH email notifications while keeping Firebase Spark

## Product authorization
Email each new valid, consented website contact to **one Microsoft 365 message addressed to four recipients**:

- contacto@lch-technologies.com
- eduardo.sacahui@lch-technologies.com
- lina.saldarriaga@lchtechnologies.onmicrosoft.com
- sara.saldarriaga@lchtechnologies.onmicrosoft.com

User explicitly requires Firebase **Spark** only. Do not enable billing, upgrade to Blaze, or deploy Cloud Functions or Secret Manager services in the Firebase project. GH-25's earlier draft implementation for Firebase Functions (PR #23) is superseded.

## Architecture

Browser LCH form + manual consent → existing named Firestore DB (`rag-municipalidades` / `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7` / `demoRequests`) → Cloudflare Workers **Free** 5-minute Cron → Google service-account OAuth2 and Firestore REST → transactionally protected conditional PATCH (optimistic updateTime precondition) → Microsoft Entra app-only token → Graph sendMail (`contacto@lch-technologies.com` sender, four fixed recipients, prospect Reply-To) → Firestore notification status.

No worker HTTP ingestion route and no public API token in Vite. Trigger runs outside the Mac, keeps its own Cloudflare secret store, and reads new leads beginning at an explicit production launch timestamp to avoid emailing old QA/test contacts. No change to lead schema/rules/Firestore tier. Existing n8n scoring uses separate `automationStatus` and remains independent.

## Security
- Bind secrets only with Wrangler: GOOGLE_SERVICE_ACCOUNT_JSON (least-privileged DB IAM), M365_TENANT_ID, M365_CLIENT_ID, M365_CLIENT_SECRET, LCH_NOTIFY_FROM. Nothing secret committed.
- Graph scope: Exchange Online Application RBAC `Application Mail.Send` limited to **one sender mailbox**; do not also grant unscoped `Mail.Send` in Entra, because permissions are additive. Verify positive authorized/negative unauthorized mailbox scope tests.
- Four destinations and sender hardcoded by product contract; never read recipient list from untrusted Firestore fields.
- Require source website, true consent, timestamp >= activation, known interest, valid contact email. HTML escape user data, bound lengths, mask credential messages, never log PII or token.
- Firestore conditional updateTime CAS prevents concurrent sends. Sending lease expires after 2 minutes. Microsoft Graph 202 means accepted by provider, **not confirmed inbox delivery**. If Graph accepts but its acknowledgement is lost, a duplicate is still possible upon retry; x-lch-lead-id can trace this.
- Bounded scan 5 pages × 40 newest documents, at most 6 claimed attempts per cron, max 7 retries. Free tier documented limits (10ms CPU/scheduled, 50 subrequests, 100k events/day). At unusually high volumes >200 new leads in lookup window, older work can be deferred or starved: instrument capped=true and migrate to queue/keyset cursor before scaling.

## Gates
- Graph quality gate: independent critic + Node and Wrangler bundle tests + Firestore wire contract and simulated network integration.
- Public release gate: authenticated Wrangler account, approved least-privileged Google service account, Microsoft Entra RBAC app, secrets, deployed Worker on Workers Free, Cron operational and **real inbox delivery observed in all four mailboxes**. Do not claim live delivery before this.
