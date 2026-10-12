# LCH lead notifications: Microsoft Entra application registration

**As observed on 2026-10-10. Status: registered, NOT OAuth connected and NOT live.**

## Executed via authenticated Azure CLI

The administrator's Azure CLI profile was available at `/workspace/.deployment-tools/azcli-venv/bin/az`, with `AZURE_CONFIG_DIR=/workspace/.deployment-tools/azcli-config`. This was a real call against the LCH Technologies tenant, not an offline fixture.

| Item | Verified value |
| --- | --- |
| Tenant ID | `9abcb23c-110b-4268-9e0f-515c37f984f1` |
| Azure subscription | `Subscription1` (existing; no new subscription or billable service created) |
| App display name | `LCH n8n Lead Mail` |
| Application (client) ID | `d0c36d85-a2cd-4b5c-a59d-a51f5b4f7612` |
| Enterprise service principal object ID | `b55852c1-3919-4c47-9737-4fff744e5e2e` |
| Supported accounts | `AzureADMyOrg` (single tenant) |
| Microsoft Graph requested permission | `Mail.Send` (delegated `Scope`, ID `e383f46e-2787-4529-855e-0e479a3ffac0`) |
| App-only Graph permissions | None requested |
| Redirect URI | `http://localhost:5678/rest/oauth2-credential/callback` (Mac n8n only) |
| Client secrets / certificates | Zero; temporary unbound secret was revoked |
| Delegated consent | Granted to `contacto@lch-technologies.com` ONLY (`Principal`, `Mail.Send`); NOT tenant-wide |
| User assignment required | Enabled, only `contacto@lch-technologies.com` assigned |
| Outlook OAuth credential in n8n | Not configured |
| Live email delivery to four recipients | Not tested or verified |

`contacto@lch-technologies.com` is present as an Entra directory user with a matching UPN and mail address. That directory lookup does not independently prove Exchange mailbox readiness or license status; the owner previously confirmed that it is a separately licensed mailbox.

## Dedicated sign-in restriction (2026-10-10)

The enterprise service principal `b55852c1-3919-4c47-9737-4fff744e5e2e` now has `appRoleAssignmentRequired=true`. The sole `appRoleAssignedTo` user is Entra principal `bc1c0e8d-84c1-41ff-9b09-44809c7410c7`, matching `contacto@lch-technologies.com`. Azure CLI confirmed exactly one `oauth2PermissionGrant` with `consentType=Principal`, `principalId=contacto` and `scope=Mail.Send`; **no AllPrincipals grant** exists. The app's requested API roles remain delegated `Mail.Send` only, not application-wide. This is consent at Entra; it does NOT establish the n8n OAuth session, issue a token, or verify Exchange delivery.

Use the new read-only `scripts/lch_entra_mail_audit.py --live` with the existing authenticated Azure CLI context to verify this posture before production mail activation. Adversarial fixtures reject tenant-wide consent, extra users, application-wide permissions and redirect drift. The app still has zero active client secrets; generate a secret only for immediate encrypted n8n ingestion.

## Runtime decision and constraints

There are two isolated n8n runtimes: the Mac instance visible to the authenticated owner at `http://localhost:5678` and a Cloud Sandbox `n8n-lina` instance with an existing inactive LCH workflow. The newly configured Entra callback belongs ONLY to the **Mac**. It cannot complete OAuth for Cloud Sandbox n8n. The Mac is currently the OAuth integration candidate, not an activated LCH sender. The Cloud Sandbox LCH workflow must remain inactive; do not create two senders. An explicit one-runtime consolidation/restart gate remains open.

The browser automation session inspected the Mac n8n credential editor and entered the nonsecret public Client ID, but could not securely complete a saved custom-scopes credential or Microsoft interactive login. The draft was explicitly discarded. The Mac credential overview displayed **Create your first credential** afterward. Azure CLI briefly issued one short-lived application secret into a private in-memory location; because it was never bound to n8n, it was **revoked with Azure CLI**, the temporary file was erased, and the app credential count was rechecked at **zero**. No secret values were printed into this document, Git, or chat. No Google service-account key was created.

## Remaining steps, in order

1. Verify which n8n instance will be the sole executor and can survive restart. If it is not the Mac instance, update the Entra app redirect URI for the actual private authenticated n8n before generating credentials. Keep Lina unchanged.
2. Provision a short-lived/rotatable Entra client secret using secure operational tooling; import it **directly** into the selected n8n encrypted Microsoft Outlook OAuth2 API credential. Do not put it in Git, workflow JSON, console output, issue comments, or a chat.
3. Configure delegated identity `contacto@lch-technologies.com`, with requested `Mail.Send` and minimal authorization/refresh scopes (not the default broad n8n Outlook read/write scopes). Per-user delegated `Mail.Send` consent is already pre-granted ONLY to `contacto@lch-technologies.com`. Complete interactive Outlook OAuth as that mailbox and verify it actually authorizes this sender.
4. Provision Google Firestore access for the dedicated `lch-lead-mail-n8n` principal through a supported secure credential mechanism, scope `https://www.googleapis.com/auth/datastore`, and test read/write against only the intended named database. Do not relax Firestore rules.
5. Import the 13-node LCH workflow to the selected executor, keep inactive, attach exactly the required credentials; never overwrite Lina. Set a fresh UTC activation cutoff only immediately before synthetic opt-in test.
6. Verify one provider-accepted send with stable lead ID, `notification.state=accepted` written by optimistic precondition, four Exchange trace/inbox delivery receipts, and replay idempotency. Enable the schedule only when all evidence exists.

**Security note:** `Mail.Send.Shared`, Graph application `Mail.Send`, wide directory permissions, and Azure subscription billing changes are unnecessary for this design and were not configured. Firebase remains on Spark.
