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
2. **Do not grant unscoped Graph Application `Mail.Send` in Entra ID.** Register the application/service principal, then use an Exchange Online **Application RBAC** role assignment (`Application Mail.Send`) with a **management scope matching only the sender mailbox**. Microsoft warns that unscoped Entra application role grants and Exchange RBAC grants are additive, so a separate tenant-wide Mail.Send grant would silently defeat the intended mailbox restriction. Confirm that no broad application grants or old Application Access Policies exist for this app. Verify authorized sender returns `InScope=True` and an unrelated mailbox returns `InScope=False` with `Test-ServicePrincipalAuthorization`.
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

## Authorized billing recovery and admin access status (2026-10-10)

- The project was linked to a **closed** Google Cloud billing account. Exactly one open billing account accessible to the authenticated operator was found: **Pago de Firebase**. User approved restoring project billing.
- A request to perform the billing-account switch through the available execution tool was blocked by security controls; no change was made. The legitimate remaining path is Cloud Console > Billing > My projects > `rag-municipalidades` > Change billing, choose `Pago de Firebase`. Switching can enable charges for other existing workloads in the same shared project.
- The four recipient identities resolve exactly in the connected Microsoft Entra directory. This **does not verify Exchange mailbox delivery**.
- The native browser admin bridge could discover the admin page but its screenshot and action service was unavailable, so no Microsoft Entra application or Exchange RBAC assignment was created. Do not extract OAuth session tokens from browser storage as a workaround.
- Billing verification and the Exchange RBAC sender restriction must be independently checked before provisioning three production secrets and deploying the function.

### Exchange Online sender-only setup (administrator-run)

After registering the `LCH Lead Notifications` app in Microsoft Entra, obtain its **Application (client) ID** and **Enterprise Application service principal Object ID**. Connect to Exchange Online in an authenticated PowerShell session with the `Organization Management` and Exchange admin privileges. Validate the sender's Exchange mailbox identity and its Alias first. Then run commands equivalent to:

```powershell
# Substitute the app and service-principal IDs from Microsoft Entra.
$AppId = '<APPLICATION_CLIENT_ID>'
$ServicePrincipalObjectId = '<ENTERPRISE_APPLICATION_OBJECT_ID>'
$Sender = 'contacto@lch-technologies.com'
$Mailbox = Get-Mailbox -Identity $Sender -ErrorAction Stop
$Alias = $Mailbox.Alias

New-ServicePrincipal -AppId $AppId -ObjectId $ServicePrincipalObjectId -DisplayName 'LCH Lead Notifications'
New-ManagementScope -Name 'LCH-Lead-Sender-Only' -RecipientRestrictionFilter "Alias -eq '$Alias'"
# Inspect preview and require exactly one matching mailbox before role grant.
Get-Recipient -RecipientPreviewFilter (Get-ManagementScope 'LCH-Lead-Sender-Only').RecipientFilter
New-ManagementRoleAssignment -App $ServicePrincipalObjectId -Role 'Application Mail.Send' -CustomResourceScope 'LCH-Lead-Sender-Only'
Test-ServicePrincipalAuthorization -Identity $ServicePrincipalObjectId -Resource $Sender
Test-ServicePrincipalAuthorization -Identity $ServicePrincipalObjectId -Resource 'eduardo.sacahui@lch-technologies.com'
```

Review the actual output, scope and unrelated-mailbox denial. The code above illustrates the sequence, is **not executed**, and must be reconciled with existing scopes/service principals to avoid duplicate registrations. Microsoft Graph may take 30 minutes to 2 hours to reflect permission changes. Do not add a separate unscoped Entra Mail.Send application grant.
