# LCH — clean notification workflow restart (14 October 2026)

## Goal

Stop troubleshooting the historical n8n LCH record. Rebuild **only the LCH notification workflow** from the last independently tested 13-node logic, with fresh workflow/node IDs and no credentials. Leave the existing Lina scheduler untouched.

**This is a new workflow, not a new instance.** Use only Mac n8n `http://localhost:5678` as the target; do not deploy a second poller. The existing historical LCH workflow must stay inactive and should only be archived after the new one has passed all delivery checks.

## Preserved live infrastructure

- Donna / website `https://lch-app.cloud` -> Firestore `rag-municipalidades`, named database `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7`, collection `demoRequests`. Firebase **Spark** unchanged.
- Mac Docker `cloud-sandbox-n8n-lina` on `http://localhost:5678`. `Lina · Agenda Orchestrator` stays active, 14 nodes.
- Microsoft Entra `LCH n8n Lead Mail` and dedicated `contacto@lch-technologies.com` mailbox. Delegated `Mail.Send` was audited; **OAuth connection and real mail delivery have NOT been verified**.
- Google Cloud IAM service identity `lch-lead-mail-n8n@rag-municipalidades.iam.gserviceaccount.com` exists with conditional Firestore access. **Effective API access and n8n credential have NOT been verified**.

## Fresh import package

`workflows/n8n/lch-contact-mail-clean.workflow.json`

- ID: `lchContactNotifyClean20261014`; 13 unique node IDs; `active=false`; trigger every five minutes but not published.
- The `Activation UTC` node uses `__REPLACE_WITH_ACTIVATION_UTC__` so manual or scheduled execution returns zero items until explicit cutover.
- Consent, source and fresh timestamp filters; Firestore compare-and-swap lease before Outlook; fixed four-recipient list; escaped HTML; strict provider acceptance and CAS ACK; bounded retries and separate `needs_review`.
- No credentials, private keys, Microsoft secrets, tokens, cookies or user profile data in the JSON. Stored execution data disabled.
- Independently runnable static/VM tests in `tests/n8nCleanRestart.test.ts`.

## Single-target activation procedure

1. Verify the Mac `cloud-sandbox-n8n-lina` health and **backup its SQLite plus WAL, config and encryption key**, preserving Lina. The previous private backup can be used for comparison.
2. **Sign into the current n8n owner session** at `http://localhost:5678` if its browser session has expired. A cached workflow list is NOT proof of an authenticated API session. Do not extract or export browser cookies.
3. Import the *fresh* workflow JSON into the existing owner project **once** from the n8n UI. Confirm the imported ID/name/node count and `active=false`. Do not import over the old LCH workflow ID. Never delete Lina.
4. Create/bind the one Google Firestore credential to all five Firestore nodes and the one Microsoft Outlook OAuth2 credential to the Outlook node. Keep secrets exclusively in n8n's encrypted credential store; avoid Google long-lived keys when policy forbids them. For Microsoft use `Mail.Send offline_access openid profile` with the dedicated `contacto` account. Validate token identity and scopes.
5. Prove a read-only Firestore query works. Set `Activation UTC` to current UTC **only immediately before a new consented QA lead**; manually execute once, verify Firestore CAS and provider acceptance. Confirm actual delivery in **all four** mailboxes or Exchange trace and rerun to prove no duplicate.
6. When all gates PASS, publish the **new LCH workflow only**, leaving historical LCH inactive/archived and Lina active. Monitor `needs_review`, 401/403 errors, credential expiry and restart persistence.

## GO / NO-GO

| Gate | Current result |
| --- | --- |
| Source pipeline and live contact form | PASS (previous live form E2E) |
| Clean inactive JSON and contract tests | PASS locally, see CI |
| Mac n8n owner authentication | **PASS via saved Chrome credentials**: actual UI request `POST /rest/login` and workflow/credential APIs returned HTTP 200 |
| Fresh workflow import into Mac instance | **PASS**: personal project shows the imported inactive 13-node LCH workflow and the unchanged published Lina workflow |
| Google Firestore service-principal authenticated query | **PENDING** |
| Microsoft 365 OAuth2 credential connected | **PENDING** |
| Actual four-mailbox delivery plus no replay | **PENDING** |
| Publish scheduled notifications | **BLOCKED until all above PASS** |

Do not enable Firestore-triggered Cloud Functions or Blaze, broaden Microsoft permissions, import a second active workflow or reset Lina.

### Final automated read-only release audit

After importing and binding the credentials, the existing preflight supports both historical and clean workflow IDs without ever activating either:

```bash
python3 scripts/lch_n8n_release_preflight.py --database /path/to/a/readable/database.sqlite --workflow-id lchContactNotifyClean20261014
```

It rejects two simultaneously active LCH workflows; this is a **configuration check**, never a substitute for actual OAuth, Firestore and four-recipient inbox confirmation.

## Verified live import evidence — 14 October 2026

- Attached Playwright via existing Chrome CDP port `9222`; reused the existing browser and autofilled login (no password, cookies, or token contents exported).
- Logged in using the actual n8n Sign in button; in-app workflows and credentials requests returned `200`.
- Created a blank workflow in the **existing** Personal project, selected Import, then supplied the private checked JSON to the editor's file input via Playwright. Its canvas contained **13** `canvas-node` elements, with the expected `LCH | Contact Notifications | CLEAN v1 (INACTIVE)` title.
- The editor exited `new=true` mode. The Personal project list showed **exactly two visible workflows**: LCH CLEAN (unpublished) and `Lina · Agenda Orchestrator` (Published).
- The UI import assigned ID `iPYnXzUIq9Vog1PM` rather than the source JSON ID. Read-only preflight now explicitly accepts both this Mac runtime ID and the canonical source ID while rejecting concurrent active LCH pollers.
- The credentials page displayed **Create your first credential**, confirming that Google/Outlook are not yet configured in this n8n instance.
- No workflow was published and no email was sent. Historical inactive LCH in SQLite was not deleted or modified.

**Remaining NO-GO:** bind Google and Microsoft credentials, test authorized Firestore read, send a new consented synthetic lead, verify four recipient inboxes and replay idempotency before publishing.
