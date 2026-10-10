# LCH Mail | Firebase Spark + Cloudflare Workers Free

## Why this design

LCH continues storing prospects in Firebase **Spark** at `rag-municipalidades`, Firestore named database `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7` and collection `demoRequests`. Cloud Functions are not deployed. Cloudflare Worker Free checks for new consented leads every five minutes and sends one Microsoft Graph mail with four explicitly authorized recipients.

This does not require changing Firebase's billing plan. Firestore reads/writes still count toward the Spark free usage quotas; the Cloudflare Free Worker also has separate quotas and a tight CPU limit. The process may stop or throttle if the free limits are reached. It is not a guaranteed unlimited free solution.

## Data flow

```text
LCH Contact form → Firestore demoRequests/{leadId} (Spark)
                          │
                Cloudflare Worker Cron (every 5 min, UTC)
                          │
                server-only Google SA OAuth2
                          │
                Firestore REST query and CAS lease
                          │
                Microsoft Entra app-only OAuth2
                          │
                Graph /users/contacto@lch-technologies.com/sendMail
                          │
       ONE message: contacto, eduardo, lina, sara
                          │
             notification.state = accepted | retry | blocked | needs_review
```

Nothing is sent from the visitor's browser. No public Worker ingestion route exists. User-supplied data is restricted to the lead body and Reply-To; the four `To` addresses are immutable.

## One-time activation (administrator required)

1. **Cloudflare Workers Free account:** sign in with the Cloudflare account authorized for LCH (Wrangler in the development sandbox currently reports **not authenticated**). Check your Workers plan is **Free**. Run `cd workers/lch-lead-mail && npm ci && npx wrangler login && npx wrangler whoami`. An interactive browser grant or scoped Workers API token is required. Do not paste the token into chat.
2. **Google service account:** create a dedicated `lch-spark-mail-reader` service account in project `rag-municipalidades` through IAM, preferably with Firestore access restricted to the specific named database. The Cloud Firestore REST API uses Google service-account OAuth2 tokens and IAM instead of client Firebase Security Rules. Give it only the minimum `datastore.entities.get`, `datastore.entities.list` / query and `datastore.entities.update` privileges needed. Review permission inheritance for other databases. Generate the JSON key only if your organization's policy allows it; store locally with restricted permissions and place it only in a Cloudflare secret. Delete any exported key when no longer needed.
3. **Microsoft 365 sender:** confirm `contacto@lch-technologies.com` exists as a licensed Exchange Online mailbox, and all four recipients accept incoming email. Register a dedicated Entra application `LCH Lead Notifications`. Configure **Exchange Application RBAC `Application Mail.Send`** scoped ONLY to the sender mailbox. **Do not grant a separate unscoped Entra Graph `Mail.Send` application consent**; the two permission systems are additive. Test authorized and unauthorized mailboxes using `Test-ServicePrincipalAuthorization`.
4. **Cloudflare secrets:** never put secrets in `wrangler.jsonc`, browser variables or source code. From `workers/lch-lead-mail/` run in a trusted interactive terminal:

   ```sh
   npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON
   npx wrangler secret put M365_TENANT_ID
   npx wrangler secret put M365_CLIENT_ID
   npx wrangler secret put M365_CLIENT_SECRET
   npx wrangler secret put LCH_NOTIFY_FROM
   ```

   For Google service account JSON use an interactive secure secret input (or redirect a protected file); never paste key text in the chat. Set `LCH_NOTIFY_FROM` to the ISO-8601 UTC time immediately **before** activating the Worker so previously stored QA leads are not mailed retroactively. If the five secrets are not available, the scheduled handler is fail-closed and does not query Firestore or send messages.
5. **Deploy only after preflight:** in the same directory run `npm run check && npm run build:check && npx wrangler deploy`. `workers_dev=false` means no public workers.dev endpoint; only the scheduled trigger is used. Cloudflare dashboard Workers > `lch-lead-mail-spark` should show Cron `*/5 * * * *`.
6. **End-to-end QA:** submit one clearly labeled synthetic contact after the launch timestamp through the actual LCH form with human-checked consent; verify the Firestore document's `notification.state=accepted`, Graph HTTP 202, and a separate receipt or Exchange message trace for **each of four recipients**. Graph `202` means accepted, *not* guaranteed delivered.

## Operational metadata

`notification.state` can be `sending`, `accepted`, `retry`, `blocked`, or `needs_review`. The Worker writes only that field and preserves existing `automationStatus` / n8n scoring. Expired sending leases are reclaimable. Errors 429/408/5xx retry; permanent 400/403 mark blocked. Seven attempts exhaust into `needs_review`. Up to six messages may be attempted each cron; up to 200 newest leads since launch can be inspected per run. Set up Cloudflare Workers Logs and check for `capped:true`, `blocked>0`, `not_configured` and errors. No prospect PII should appear in logs.

**Important scaling caveat:** To honor the Workers Free subrequest limit, polling scans a bounded window. At sustained high volume, old failed requests may eventually fall outside the window and require a durable queue or pagination cursor. Evaluate that before treating this as high-volume infrastructure.

## Rollback

Remove/disable the Cron Trigger in Cloudflare dashboard or deploy `triggers.crons=[]` using Wrangler to stop future sends. The LCH website and Firestore submissions keep operating independently. Preserve the existing four-recipient contact record and the accepted states for auditing; disabling the Worker does not erase leads.

## Current activation status

The code can be tested and merged without access to secrets. **No email is considered delivered** until the authenticated Cloudflare and Microsoft administrative setup plus four-inbox QA pass. The original Firebase Functions PR #23 is superseded and must not be merged or deployed while Spark is required.

## Provenance and restrictions

`firestore.rules` in the LCH repository restricts client creates to an exact field list and forbids client reads/updates. The Worker does not require relaxing it. Verify deployed Firestore rules independently before production; repository rules do not automatically prove the live rules are identical.
