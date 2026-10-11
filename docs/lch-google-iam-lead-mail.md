# LCH: Firestore service identity for Spark lead notifications (GH-29)

**Status 2026-10-10: identity and project IAM configuration verified; credential and Microsoft mail delivery NOT configured.**

## Dedicated identity

| Property | Verified value |
| --- | --- |
| Project | `rag-municipalidades` |
| Firebase plan | **Spark** — unchanged |
| Named Firestore DB | `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7` |
| New service account | `lch-lead-mail-n8n@rag-municipalidades.iam.gserviceaccount.com` |
| Project IAM role | `roles/datastore.user` |
| Condition | `resource.name=="projects/rag-municipalidades/databases/ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7"` |
| Additional direct project IAM grants for this identity | **0** |
| USER_MANAGED keys | **0** |
| Credentials in Cloud Sandbox n8n | **0** |
| LCH workflow | INACTIVE, 13 nodes |
| Lina workflow | ACTIVE, unchanged |

This IAM Condition follows the documented Firestore per-database policy pattern. The read-only audit verifies this account's **direct project IAM bindings**, not inherited organization/folder bindings or effective Firestore access using its own OAuth identity. Actual Firestore read/write access must be tested after the account is authenticated. The original `lch-n8n-firestore` account was **not altered** and retains its existing key and role.

Documentation: https://firebase.google.com/docs/firestore/manage-databases#configure_per-database_access_permissions

## Independent read-only check

From the authenticated Cloud Sandbox workstation:

```bash
cd /workspace/projects/LCH-Technologies
node scripts/lchGoogleIamAudit.cjs --live
```

The utility uses existing Firebase CLI authentication **in memory** for Google IAM read operations and prints only policy booleans and a count of keys, never API tokens, private keys, customer records, or credentials. It exits nonzero if the expected exact conditional grant is missing, if unexpected direct project IAM grants exist, or if the account is missing. Fixture tests cover privileged, unconditional, wrong-database and duplicate grants. It deliberately never creates keys, never modifies IAM, and is not a substitute for a service-principal API test.

## Credential provisioning constraint

The attempted automated private-key creation and n8n credential import was **blocked by the environment's safety controls before execution**. A separate read-only audit confirmed **0 user-managed keys and 0 n8n credentials**, so no private key was created or exposed by GH-29. Do not bypass the block by uploading secrets to GitHub or pasting them into chat.

The authorized administrator must finish the connection through a **secure, private n8n administration session** for the **Cloud Sandbox instance**, not the different n8n served by the Mac at `http://localhost:5678`. Create the **Google Service Account API** credential in that n8n instance and assign it to exactly these five nodes:

1. `Read Consented Contacts`
2. `Claim Firestore Lease`
3. `Record Needs Review`
4. `Re-read Firestore Lease`
5. `Record Outlook Acceptance`

Scope: `https://www.googleapis.com/auth/datastore`. If key-based authentication is forbidden, implement a supported keyless workload identity or short-lived token provider that works with the selected n8n credential/node combination. Do not weaken Google org policy. Validate a **read-only query** first, then one controlled conditional update of a synthetic opted-in lead.

## Outlook delegated authorization: avoid broad scopes

The user confirmed `contacto@lch-technologies.com` is a **separately licensed mailbox**. Authenticate Outlook as `contacto@` itself and use **delegated `Mail.Send` only**, plus minimal identity and refresh scopes needed by the installed OAuth2 credential. There is no need for `Mail.Send.Shared` or Exchange Online `Send As` because this principal sends as itself. The installed n8n 2.39.6 Outlook OAuth2 credential's **default scopes include Contacts.ReadWrite, Calendars.ReadWrite and Mail.ReadWrite**; these are wider than necessary. Configure `Custom Scopes` to avoid excess rights, subject to verifying the installed provider behavior.

Microsoft guidance: https://learn.microsoft.com/en-us/graph/outlook-send-mail-from-other-user

Before any Entra app registration, establish a private operator-accessible OAuth callback URL for the selected Cloud Sandbox n8n. The `http://localhost:5678/rest/oauth2-credential/callback` URI observed on the **Mac n8n** points to the **wrong instance** and must not be reused for Cloud Sandbox. Do not open the unauthenticated n8n editor on the public internet.

## Final release gate

Run `python3 scripts/lch_n8n_release_preflight.py` on the **sandbox** DB. Only after all credentials are actually bound, authenticated and tested, replace the activation placeholder with the current UTC instant and complete a fresh **consented** QA lead. Inspect Microsoft Graph provider acceptance, Firestore notification state and actual receipt in the four requested inboxes. Keep LCH inactive until these external gates pass. Firebase remains Spark.
