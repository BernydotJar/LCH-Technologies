# LCH | Existing n8n Contact Mail | Firebase Spark

## Product and destinations

The visitor submits LCH Contact with explicit consent. Firebase Spark stores the contact in project `rag-municipalidades`, named Firestore DB `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7`, collection `demoRequests`. An **existing self-hosted n8n 2.39.6** container can poll for new leads and send **one Outlook email to exactly four recipients**:

- contacto@lch-technologies.com
- eduardo.sacahui@lch-technologies.com
- lina.saldarriaga@lchtechnologies.onmicrosoft.com
- sara.saldarriaga@lchtechnologies.onmicrosoft.com

The Microsoft Outlook node is configured with `From: contacto@lch-technologies.com` and the prospect as `Reply-To`. Sender mailbox permissions must actually authorize that identity. The recipient list is coded in the n8n Code node and cannot be changed by a visitor.

## Installed state (2026-10-10)

- Existing container: `/workspace/_shared/lina-n8n-runtime`, running as `n8n-lina`, n8n **2.39.6**, local `http://127.0.0.1:5678/healthz` returns `{"status":"ok"}`.
- **The Lina Agenda workflow remains active and unchanged.** No ingress/tunnel for the n8n editor was enabled.
- New workflow `lchContactNotifyN8nGH26`, named `LCH | Contact Notifications | Spark to Outlook (INACTIVE until credentials)`, imported through n8n's CLI into the existing personal project.
- **It is INACTIVE and contains no stored credentials. No Outlook messages have been sent.** The source is `workflows/n8n/lch-contact-mail-spark.workflow.json`.
- Prior consistent local backup of n8n's database: `/workspace/.tmp/n8n-gh26-before-import.sqlite` (private local path, not an artifact to publish).
- GitHub's Cloudflare Worker alternative GH-25 was merged but **never deployed**; never activate two lead senders at once.

## Activation checklist — authenticated administrator

1. Ensure **private n8n owner access and reliable uptime**: the container is local only, not a production-hosted cloud service. Set up/verify an n8n owner account, restrict the editor with authentication and a private network or Cloudflare Access, and configure restart supervision. The workstation had previously lost the n8n process after recreation; do not activate a customer-notification service until the restart test is passed.
2. **Google service account**: use least-privileged IAM (Firestore named database get/list/update only) in project `rag-municipalidades`. Never relax the visitor's `firestore.rules` or expose a service-account key to the browser. In n8n, create a **Google Service Account API** credential (`googleApi`) and enable its **HTTP Request node** use with scope `https://www.googleapis.com/auth/datastore`. Attach it to `Read Consented Contacts`, `Claim Firestore Lease`, `Re-read Firestore Lease`, and `Record Outlook Acceptance`. Keep the JSON key in n8n's encrypted credentials, never in a workflow export or repository. Verify Firestore IAM is limited to the intended named database to avoid cross-project data exposure.
3. **Outlook credential**: in n8n, create **Microsoft Outlook OAuth2 API** credential associated with a principal authorized to send as `contacto@lch-technologies.com`. For self-hosted n8n this may require a dedicated Microsoft Entra app registration and Outlook OAuth2 callback setup. Prefer delegated `Mail.Send` from the sender or approved `Send As`; do not grant a tenant-wide app-only `Mail.Send` permission. Connect this credential only to `Outlook Send Four Recipients`. Confirm sender mailbox identity and domain ownership. Use a separate consented test send before activation.
4. Edit the `Activation UTC` Code node and replace `__REPLACE_WITH_ACTIVATION_UTC__` with a **fresh** ISO-8601 UTC timestamp such as `2026-10-10T20:00:00Z`, based on the real moment of intended activation. This prevents emailing historic test leads. Do not set a future timestamp or remove the guard.
5. Verify the nodes locally in manual mode using a **synthetic consented lead** after activation time. The workflow uses a Firestore `currentDocument.updateTime` precondition to claim the lead and to mark `notification.state=accepted` after Outlook returns success. Conflicts abort the run **before sending**; a duplicate is still possible if the mail provider accepts a send and the ACK cannot be persisted. All emails include `x-lch-lead-id` for auditing.
6. Turn on the n8n workflow only after the sender test, restart check and all credentials have passed. Confirm the **four actual inbox receipts** and, if possible, Microsoft Exchange message trace. A Graph HTTP 202 accepted response is not proof of delivery.

## Workflow stages

| Step | Node | Purpose |
| --- | --- | --- |
| 1 | Every 5 Minutes | Scheduler, every 5 minutes |
| 2 | Activation UTC | Fail closed until cutoff is explicitly configured |
| 3 | Read Consented Contacts | Named Firestore query, newest 40 documents created after activation |
| 4 | Prepare eligible leads | Validate consent and source, escape HTML, make fixed four-recipient email, stop accepted/exhausted/leased leads, max 6 at once |
| 5 | Claim Firestore Lease | Conditional REST PATCH with updateTime to avoid concurrent claims |
| 6 | Outlook Send Four Recipients | Native Outlook node, one message and explicit Reply-To |
| 7 | Re-read Firestore Lease | Obtain fresh updateTime after email accepted |
| 8 | Verify Original Lease | Ensure own sending lease remains authoritative |
| 9 | Record Outlook Acceptance | Conditional REST PATCH of `notification` field only |

The original `automationStatus` lead-scoring field remains intact. If Graph fails, the lease expires in two minutes and the record can be retried until the seven-attempt threshold, then requires human review. Because a Cron batch may abort on a CAS failure, subsequent scheduled executions must be monitored. The query's bounded 40-lead window may need an explicit durable cursor/queue at scale. The workflow does not provide exactly-once semantics.

## Restore or inspect safely

Run against **the existing n8n container** (not a new deployment):

```bash
/workspace/_shared/lina-n8n-runtime/bin/status-stack.sh
curl -fsS http://127.0.0.1:5678/healthz
```

If n8n is down, `/workspace/_shared/lina-n8n-runtime/bin/start.sh` reactivates the existing persisted n8n data. Before importing or changing an active workflow, back up the database. Import **inactive** using the dedicated personal project via n8n CLI as documented by `n8n import:workflow --help`; never use `--activeState=fromJson` when testing. Do not reset n8n user management, clear credentials, expose the editor publicly, or modify Lina's workflow.

## Monitoring and rollback

Watch n8n execution history, Firestore `notification.state`, repeated `sending` leases and the expiry retry window. Monitor `blocked`/provider authorization errors and the 40-lead query window. Disabling **only** the LCH workflow immediately stops sending without affecting Lina or the LCH website. The existing Cloudflare Worker is an **inactive alternative**, not a simultaneous backup sender.

**Production status:** awaiting Google n8n credential, authorized Outlook OAuth credential, reliable n8n uptime and a real four-mailbox receipt test. Firebase remains **Spark** throughout.

## Execution-data minimization

This workflow disables saving successful/error/manual executions and execution progress in its n8n settings. Firestore remains the durable record and the `notification` field retains machine status. Do not paste prospect data into debug logs or use n8n pinned data. If manual troubleshooting is needed, use synthetic contacts and turn debugging off before activation.
