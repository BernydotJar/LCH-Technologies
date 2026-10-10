# LCH email notifications | Microsoft 365

## Approved recipients
A single notification message includes:

- contacto@lch-technologies.com
- eduardo.sacahui@lch-technologies.com
- lina.saldarriaga@lchtechnologies.onmicrosoft.com
- sara.saldarriaga@lchtechnologies.onmicrosoft.com

**Sender mailbox:** `contacto@lch-technologies.com` (must exist and be authorized in Exchange Online). `Reply-To` is the prospect's email so the commercial team can respond directly. The email has name, company, role, interest, description, and lead reference. Every external string is HTML-escaped.

## Architecture

```text
LCH public form + explicit consent
  -> Firestore named database (durable) demoRequests/{leadId}
  -> Cloud Functions v2 onDocumentCreated, region us-west1
  -> transaction claim + retry control + audit notification metadata
  -> Microsoft Entra client-credentials token (Secret Manager)
  -> Microsoft Graph /users/contacto@lch-technologies.com/sendMail
  -> one message, 4 To recipients, Reply-To contact
```

The website does not call Microsoft Graph and does not expose Entra secrets. The existing n8n HOT/WARM/LOW processor can continue separately; its `automationStatus` fields are not replaced. Firebase Cloud Functions runs independently of the self-hosted LCH website and Cloud Sandbox.

## Administrator activation checklist

1. In **Microsoft Entra admin center** create a dedicated application called `LCH Lead Notifications` in the tenant hosting the LCH mailboxes. Authenticate with a certificate or a client secret in a secret store. Do not paste the secret into chat or source code.
2. Authorize Microsoft Graph **application** `Mail.Send` through an administrator-approved, mailbox-scoped Exchange Online **Application RBAC** assignment limited to the sender mailbox. Do not leave unscoped tenant-wide send permission; application roles and Entra grants must be reviewed for actual effective scope.
3. Confirm `contacto@lch-technologies.com` is an Exchange Online mailbox enabled for this sender. Confirm the four recipients exist and accept delivery.
4. Authenticate Firebase CLI with deployment rights on project `rag-municipalidades`. The existing Firestore named database is in `us-west1`, Firestore Native / Enterprise. The project must permit Cloud Functions v2, Eventarc and Secret Manager (billing and API permissions).
5. Supply the real Entra tenant ID, application/client ID and secret to Firebase Secret Manager through approved secure tooling. For example, run each interactively (never put secret text in a command argument):

   ```bash
   firebase functions:secrets:set LCH_M365_TENANT_ID --project rag-municipalidades
   firebase functions:secrets:set LCH_M365_CLIENT_ID --project rag-municipalidades
   firebase functions:secrets:set LCH_M365_CLIENT_SECRET --project rag-municipalidades
   ```
6. Deploy only the isolated notification function, never the entire Firebase project:

   ```bash
   firebase deploy --only functions:lch-lead-alerts:lchLeadMailNotification --project rag-municipalidades
   ```
7. Validate exactly one synthetic lead **after** activation with clearly marked QA name and a manually checked consent box. Verify Graph HTTP 202 in function logs, `notification.state=accepted` in Firestore and receipt in **all four actual Outlook inboxes**. Keep the test lead out of the sales pipeline.

## Delivery states and operations

- `notification.state=sending`: one function instance has a time-limited claim.
- `accepted`: Microsoft Graph returned HTTP 202. This is not proof of inbox delivery. Investigate Exchange message trace for definitive status.
- `retry`: a transient 429, 5xx, timeout or transport failure. The event retries, bounded to seven attempts.
- `blocked`: a permanent authorization/configuration response. An administrator must correct Entra/Exchange before replaying.
- `invalid`: this is not a valid consented website contact; never email it.
- `needs_review`: retries exhausted; review manually and handle with an audited replay procedure.

**Important:** Eventarc delivery is at least once. Transactions avoid duplicate concurrent sends, but a crash *after* Graph accepts and *before* Firestore records acceptance can still produce a duplicate on retry. The stable lead reference and `x-lch-lead-id` header make that scenario traceable.

## Release condition
The code and tests can be merged, but **email delivery is not live** until mailbox permissions, three secrets, Firebase deploy and a real end-to-end recipient confirmation have passed. Never announce delivery based only on mock tests.

## Current infrastructure blocker (verified 2026-10-10)

- `firebase firestore:databases:list` verified named Firestore Enterprise database in `us-west1`.
- Firebase CLI account can list the project and its database.
- `firebase deploy --only functions:lch-lead-alerts:lchLeadMailNotification --dry-run` reached Secret Manager and failed with **HTTP 403: billing must be enabled** for `rag-municipalidades`.
- **Do not run a real deploy yet.** Project billing, Microsoft Entra scoped authorization and secret values are outstanding. `firebase deploy --dry-run` can still touch API-enablement checks; do not interpret it as a zero-side-effect simulation.
- `contacto@lch-technologies.com` must be a real mailbox with Microsoft Graph send permission. The tool did not verify the mailbox exists.
