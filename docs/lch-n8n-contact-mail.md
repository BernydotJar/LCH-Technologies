# LCH | Existing n8n Contact Mail | Firebase Spark

## Product and destinations

The visitor submits LCH Contact with explicit consent. Firebase Spark stores the contact in project `rag-municipalidades`, named Firestore DB `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7`, collection `demoRequests`. An **existing self-hosted n8n 2.39.6** container can poll for new leads and send **one Outlook email to exactly four recipients**:

- contacto@lch-technologies.com
- eduardo.sacahui@lch-technologies.com
- lina.saldarriaga@lchtechnologies.onmicrosoft.com
- sara.saldarriaga@lchtechnologies.onmicrosoft.com

The Microsoft Outlook node is configured with `From: contacto@lch-technologies.com` and the prospect as `Reply-To`. Sender mailbox permissions must actually authorize that identity. The recipient list is coded in the n8n Code node and cannot be changed by a visitor.

## Important: two independent n8n installations (verified 2026-10-10)

- **Cloud Sandbox workstation**: `http://127.0.0.1:5678` *inside the isolated Linux workspace*, running container `n8n-lina` 2.39.6. This is the location of the **installed LCH GH-28 workflow** and its supervisor keeper. It has **zero credentials** and **LCH is inactive**. It has no authenticated owner/editor accessible in the user's Mac browser.
- **User's Mac in Chrome**: `http://localhost:5678/home/workflows` opens a **different n8n instance**. Computer Use confirmed its `Credentials` view displays **Create your first credential**; it has only **Lina · Agenda Orchestrator** listed and does **not** yet contain the LCH GH-28 workflow. This authenticated view is NOT a dashboard for the Cloud Sandbox instance.

**Never treat `localhost:5678` on the Mac as the Cloud Sandbox container.** If the Mac instance will be the commercial email executor, the approved LCH workflow must be imported there, its OAuth credentials created there and **Mac host** process supervision verified. The GH-27 keeper operates ONLY within Cloud Sandbox. If the sandbox instance will be used instead, provide private authenticated admin access and a usable Microsoft OAuth2 callback for **that actual instance**, not the Mac's localhost address. Only one may ever send mail for LCH.

## Installed state (2026-10-10)

- Existing container: `/workspace/_shared/lina-n8n-runtime`, running as `n8n-lina`, n8n **2.39.6**, local `http://127.0.0.1:5678/healthz` returns `{"status":"ok"}`.
- **The Lina Agenda workflow remains active and unchanged.** No ingress/tunnel for the n8n editor was enabled.
- New workflow `lchContactNotifyN8nGH26`, named `LCH | Contact Notifications | Spark to Outlook (INACTIVE until credentials)`, imported through n8n's CLI into the existing personal project.
- **It is INACTIVE and contains no stored credentials. No Outlook messages have been sent.** The source is `workflows/n8n/lch-contact-mail-spark.workflow.json`.
- Prior consistent local backup of n8n's database: `/workspace/.tmp/n8n-gh26-before-import.sqlite` (private local path, not an artifact to publish).
- GitHub's Cloudflare Worker alternative GH-25 was merged but **never deployed**; never activate two lead senders at once.

## Activation checklist — authenticated administrator

1. Ensure **private n8n owner access and reliable uptime**: the container is local only, not a production-hosted cloud service. Set up/verify an n8n owner account, restrict the editor with authentication and a private network or Cloudflare Access, and configure restart supervision. The workstation had previously lost the n8n process after recreation; do not activate a customer-notification service until the restart test is passed.
2. **Google service account**: use least-privileged IAM (Firestore named database get/list/update only) in project `rag-municipalidades`. Never relax the visitor's `firestore.rules` or expose a service-account key to the browser. In the selected n8n instance, create a **Google Service Account API** credential (`googleApi`) and enable its **HTTP Request node** use with scope `https://www.googleapis.com/auth/datastore`. Attach it to `Read Consented Contacts`, `Claim Firestore Lease`, `Record Needs Review`, `Re-read Firestore Lease`, and `Record Outlook Acceptance`. Keep the JSON key in n8n's encrypted credentials, never in a workflow export or repository. Verify Firestore IAM is limited to the intended named database to avoid cross-project data exposure.
3. **Outlook credential**: in n8n, create **Microsoft Outlook OAuth2 API** credential associated with a principal authorized to send as `contacto@lch-technologies.com`. For self-hosted n8n this may require a dedicated Microsoft Entra app registration and Outlook OAuth2 callback setup. Prefer delegated `Mail.Send` from the sender or approved `Send As`; do not grant a tenant-wide app-only `Mail.Send` permission. Connect this credential only to `Outlook Send Four Recipients`. Confirm sender mailbox identity and domain ownership. Use a separate consented test send before activation.
4. Edit the `Activation UTC` Code node and replace `__REPLACE_WITH_ACTIVATION_UTC__` with a **fresh** ISO-8601 UTC timestamp such as `2026-10-10T20:00:00Z`, based on the real moment of intended activation. This prevents emailing historic test leads. Do not set a future timestamp or remove the guard.
5. Verify the nodes locally in manual mode using a **synthetic consented lead** after activation time. The workflow uses a Firestore `currentDocument.updateTime` precondition to claim the lead and to mark `notification.state=accepted` after Outlook returns success. Conflicts are filtered **before sending**; a duplicate is still possible if the mail provider accepts a send and the ACK cannot be persisted. All emails include `x-lch-lead-id` for auditing.
6. Turn on the n8n workflow only after the sender test, restart check and all credentials have passed. Confirm the **four actual inbox receipts** and, if possible, Microsoft Exchange message trace. A Graph HTTP 202 accepted response is not proof of delivery.

## Workflow stages (GH-28, 13 nodes)

| Step | Node | Purpose |
| --- | --- | --- |
| 1 | Every 5 Minutes | Scheduler |
| 2 | Activation UTC | Fail closed until cutoff is explicitly configured |
| 3 | Read Consented Contacts | Named Firestore query; newest 40 after activation; branches to send and dead-letter review |
| 4 | Prepare eligible leads | Strict consent/source and fixed four-recipient HTML email, bounded to 6 |
| 5 | Claim Firestore Lease | Optimistic CAS conditional PATCH; continue on conflict |
| 6 | Confirm Firestore Lease | Explicitly require matching persisted lease ID before any mail |
| 7 | Outlook Send Four Recipients | Native delegated Outlook, one message, fixed four To, prospect Reply-To; continue on error |
| 8 | Confirm Outlook Accepted | Require explicit `{success:true}` from real n8n Outlook v2 operation before ACK |
| 9 | Re-read Firestore Lease | Refresh optimistic updateTime after mail acceptance |
| 10 | Verify Original Lease | Confirm current sender still owns the lease |
| 11 | Record Outlook Acceptance | Conditional PATCH `notification.state=accepted` only |
| 12 | Select Retry-Exhausted Leads | Separate branch scans only same consented/active-time leads with 7+ attempts and expired lease |
| 13 | Record Needs Review | CAS PATCH `notification.state=needs_review` without email; conflicts contained |

An Outlook 403/429/5xx error is **not** marked accepted. A two-minute sending lease expires, allowing another scheduled attempt. After seven attempts, the separate dead-letter branch marks the contact `needs_review` for human investigation. A crash after Microsoft accepts mail but before the Firestore acknowledgement can still cause a duplicate; the stable `x-lch-lead-id` allows tracing. `accepted` means Outlook's API returned success, **not** inbox delivery.

The original `automationStatus` lead-scoring field remains intact. The query's bounded 40-lead window may require a durable cursor/queue at scale. The workflow does not provide exactly-once semantics. All 13 nodes were imported **inactive** and checked against the native n8n 2.39.6 operation definitions, not only mocked tests.

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

## GH-27 — local n8n process availability

An operational monitoring guard was installed into the existing LCH Supervisor (same workstation, **no new container**) as `lch-n8n-keeper`. Every 45 seconds, it checks `http://127.0.0.1:5678/healthz`. If the existing runtime is unhealthy, it calls only `/workspace/_shared/lina-n8n-runtime/bin/start.sh`; it does not change Lina's workflow or activate LCH's email workflow. The keeper's source is `scripts/lch-n8n-keepalive.sh`, installed as `/workspace/.deployment-tools/lch-n8n-keepalive.sh`.

To inspect:

```bash
/workspace/.deployment-tools-venv/bin/supervisorctl -c /workspace/.deployment-tools/lch-site-supervisord.conf status
/workspace/_shared/lina-n8n-runtime/bin/status-stack.sh
```

Rollback without touching the website or Lina's data:

```bash
cp /workspace/.deployment-tools/lch-site-supervisord.conf.pre-gh27-n8n-monitor /workspace/.deployment-tools/lch-site-supervisord.conf
/workspace/.deployment-tools-venv/bin/supervisorctl -c /workspace/.deployment-tools/lch-site-supervisord.conf reread
/workspace/.deployment-tools-venv/bin/supervisorctl -c /workspace/.deployment-tools/lch-site-supervisord.conf update
```

The monitor is **not** proof of service availability across a full Cloud Sandbox workstation recreation. Before LCH's first live email, validate host boot behavior, authenticated ownership, workflow credentials and a full four-recipient test.

**Source of deployed supervisor stanza:** `infra/lch-n8n-keeper.supervisor.conf`. A process-level SIGTERM restart of the corrected keeper was verified; the monitor stays running and does not modify the Lina workflow. A complete host/workstation reboot is still unverified.

## GH-28 — release gate / credential prerequisites

The native Microsoft Outlook OAuth2 API credential editor on the **Mac** requires the dedicated Entra application **Client ID**, **Client Secret**, and explicitly shows redirect URL `http://localhost:5678/rest/oauth2-credential/callback`. Credentials are currently absent. The Cloud Sandbox n8n also has zero credentials. Creating a blank credential is not a successful OAuth connection, and logging into n8n is not a Microsoft/Google grant.

Use `docs/lch-n8n-activation-runbook.md` for admin consent, Firestore IAM, one-engine selection, activation and real inbox receipts. On the sandbox instance, run the **read-only** audit:

```bash
python3 scripts/lch_n8n_release_preflight.py
```

A missing bound Google or Outlook credential, placeholder start time, old workflow revision, or inactive workflow reports `ready=false`, with machine-readable blocker names and **no secrets**. Even `ready=true` is only a configuration check; it does NOT prove OAuth validity or mail receipt.
