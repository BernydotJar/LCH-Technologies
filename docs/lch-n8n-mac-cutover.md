# GH-30: LCH n8n Mac single-executor cutover

**Status: existing Mac LCH record reported by CLI; read-only owner audit and live notification gate NOT YET VERIFIED.**
**Date:** 2026-10-10. **Firebase:** Spark only. **Authoritative lead source:** `rag-municipalidades` named Firestore database `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7` / `demoRequests`.

## Runtime decision

Use the authenticated existing **Mac** `cloud-sandbox-n8n-lina` as the only future LCH sender. The macOS browser has the Entra callback `http://localhost:5678/rest/oauth2-credential/callback`, and the existing Lina automation is published there. Its initial inventory showed exactly **one** workflow (`Lina · Agenda Orchestrator`) and no saved credentials, with no LCH workflow. The separate Linux Cloud Sandbox nested `n8n-lina` holds the 13-node LCH workflow **inactive**. Leave it inactive; do not run two pollers over the same Firestore collection. No Cloudflare Worker notification executor should be deployed concurrently.

This choice does not migrate or interrupt Lina. A Mac SQLite backup path was observed in a separate Mac terminal session, but this alone does **not** verify that every migration or credential was completed. A controlled Mac bootstrap remains required.

## Safe deterministic bootstrap

Files:

- `scripts/lch-n8n-mac-bootstrap.sh` - Mac-host-only dry-run and inactive import, with restart/health checks, pinned source, SQLite backup, owner-project resolution and after-import validation.
- `scripts/lch_n8n_workflow_guard.py` - recognizes exact existing LCH without reimport; distinguishes correctly owned from orphaned or other-project records; rejects changed executable code, wrong database, premature activation and any modification of Lina.
- `tests/test_lch_n8n_workflow_guard.py` - adversarial regression fixtures for pre-/postconditions.
- `scripts/lch_entra_mail_audit.py` and `tests/test_lch_entra_mail_audit.py` - Entra identity/consent audit and negative permission fixtures.

The pinned GitHub source is workflow JSON at commit `97f027b248440b89ac715d8e9b77109a47045821` with SHA256 `c419f62402ad6758d9cbef605b3c981f404a66e110d23d488bcca080bf7da1f0`; the source contains **exactly 13 nodes**, `active=false` and an unset activation timestamp. This script does **not** create or store Google/Microsoft secrets and does **not** enable the recurring trigger.

### Mac execution (terminal on the Mac, NOT inside dev-main)

The verified scripts have been staged in the **existing shared Mac handoff**; no container copy or new URL is necessary:

```bash
cd "$HOME/.cloud-sandbox-mcp-data/shared-auth/deployment/handoff/lch-app/n8n-gh30"
bash lch-n8n-mac-bootstrap.sh --dry-run
```

### Existing LCH detected on the Mac (operator finding)

The operator ran the initial GH-30 dry-run. The canonical source guard passed, but `n8n export:workflow --all` **already included LCH** and the original strict importer returned `LCH_N8N_GUARD_BLOCKED: LCH workflow already exists; import would duplicate it`. This is evidence that the record exists, **not** proof that it is correctly project-owned, credentialed, executable or visible in the n8n UI. The Mac browser previously showed Lina alone, so an orphaned LCH record is possible; do not assume this diagnosis without the new read-only membership result.

GH-30's updated dry-run now inspects the existing 13-node workflow and reads only ownership rows from the persistent n8n SQLite database. It **never exports tokens, accesses leads, or changes workflow/project records**. Possible results:

- `ALREADY_INSTALLED_INACTIVE`: LCH matches the canonical workflow, remains inactive, and has the same n8n project owner as Lina. **Skip import**. Continue with secure credentials and delivery tests.
- `BLOCKED_EXISTING_ORPHAN`: LCH matches the source but has no owning project. Do **not** repeat the import or manipulate Lina. A separately reviewed backed-up orphan adoption is required.
- `BLOCKED_EXISTING_OTHER_PROJECT`: LCH has a different project owner. Do not reassign or overwrite without operator review.
- `LCH_N8N_GUARD_BLOCKED`: the stored LCH differs in executable code/routing, was activated, or is otherwise inconsistent. Investigate drift; do not overwrite it.
- `READY_FOR_INACTIVE_IMPORT`: only when LCH is **absent**, Lina is uniquely owned, and the source checksum passes. This is the sole state in which `--apply` should actually import anything.

Even in `ALREADY_INSTALLED_INACTIVE`, `--apply` is a no-op; it does not reset existing credentials, workflows or activation values. It is unnecessary to run `--apply` for this state.

Only if `--dry-run` reports `READY_FOR_INACTIVE_IMPORT`, run:

```bash
bash lch-n8n-mac-bootstrap.sh --apply
```

Do not run those commands in the Linux Cloud Sandbox container: `docker` there connects to a distinct nested daemon. On Mac, the script refuses a container other than `cloud-sandbox-n8n-lina`, requires an existing active instance, correct restart policy, correct workflow checksum and a unique Lina project. It makes a **hot SQLite backup** before import and checks that Lina's workflow remains identical after the 13-node LCH import. Backups are private at `~/.cloud-sandbox-mcp-data/backups/lch-n8n`. Do not place them in GitHub, chat or Drive.

The script intentionally does **not** restart n8n or manipulate active workflows. For the pre-existing case, it performs a read-only source/owner comparison and exits without creating backups or modifying workflows. Refresh the n8n UI to verify the imported LCH entry remains inactive.

### Remaining secure credential steps

1. In the **Mac** n8n instance, create the Google Service Account API credential under the pre-provisioned dedicated account `lch-lead-mail-n8n@rag-municipalidades.iam.gserviceaccount.com`. Only provision the private key through a secure, approved vault/credential admin mechanism. The n8n credential scope must be `https://www.googleapis.com/auth/datastore`; bind it to five Firestore nodes. No service-account private key may be checked into Git or printed into an execution log. If organization policy denies long-lived SA keys, adopt a supported keyless broker/workload identity instead of weakening policy.
2. In Microsoft Entra, application `LCH n8n Lead Mail`, Client ID `d0c36d85-a2cd-4b5c-a59d-a51f5b4f7612`, **single tenant** with only delegated Graph `Mail.Send`, already has the Mac OAuth redirect. The enterprise app now REQUIRES user assignment, and only `contacto@lch-technologies.com` is assigned and pre-consented to delegated `Mail.Send`; other tenant accounts cannot sign in to this app. Generate a client secret **only when** n8n's private encrypted credential is ready; enter it directly there. The earlier temporary unused secret was revoked and Azure currently showed no active credentials. Use custom scopes `Mail.Send offline_access openid profile`, not n8n's broad default mail/calendar/contact read-write scopes. Keep `Use Shared Mailbox` off. Sign in as `contacto@lch-technologies.com` and complete the interactive OAuth login (dedicated per-user `Mail.Send` consent has already been granted). The owner previously confirmed that mailbox has its own license.
3. Test a read-only Firestore query with the service principal in the correct named database. IAM configuration audit by itself does not prove effective Firestore API access; token impersonation from the Firebase administrator returned `403 PERMISSION_DENIED`, without changing IAM roles or key policies.
4. Set the **current UTC** cutoff immediately before submitting a new explicitly consented **synthetic** test lead. The n8n scanner must not reprocess prior real contacts. Run the 13 nodes manually once; verify Firestore optimistic CAS and state `notification.state=accepted` only on positive Microsoft Graph send acceptance, re-run to prove no duplicate, and inspect the retry-exhausted path without sending repeated emails.
5. Check **all four actual mailboxes** using Exchange message trace or independently verified inbox receipts. API `success:true` does **not** prove delivery. The four recipients are fixed in source; prospect email is Reply-To.
6. Only if each preceding gate passes, publish/activate **only Mac LCH** scheduling and prove Mac host restart persistence; sandbox LCH and Cloudflare Worker remain off. Alert on n8n downtime and `needs_review`.

## Verified today versus pending

| Gate | Result |
| --- | --- |
| Mac n8n owner UI authenticated, only Lina listed | PASS (visual browser evidence) |
| Existing Mac LCH record detected by CLI export | OBSERVED; owner/visibility/activation unknown |
| Mac-host idempotent owner audit | PENDING re-run with updated bootstrap |
| Source contract and duplicate/Lina guard | PASS (26/26 adversarial fixtures; additional CI gate) |
| Cloud Sandbox n8n duplicate prevention | PASS (existing inactive LCH correctly rejected) |
| Dedicated Google SA conditioned IAM | PASS (policy only) |
| Effective Google service-principal Firestore read/write | NOT VERIFIED |
| Entra app with delegated `Mail.Send` and correct Mac callback | PASS |
| Explicit contacto-only assignment and per-user delegated consent | PASS (live audit, 10/10 fixtures) |
| Microsoft Client Secret and n8n OAuth sign-in | PENDING |
| Four mailbox delivery receipts | PENDING |
| Live schedule trigger and replay control | BLOCKED |

**Release rule:** no customer-facing claim of operational email delivery until all mail and data gates are proven.

## Azure CLI workstation installation (not committed as binaries)

The Cloud Sandbox operator has Azure CLI `2.91.0` in the local isolated environment `/workspace/.deployment-tools/azcli-venv/bin/az`. Its private session data is under `/workspace/.deployment-tools/azcli-config` with restrictive filesystem access. Do not add the directory, OAuth tokens, device-login codes or any Entra secret to Git. After re-creating the workstation, the administrator can install the same pinned CLI version via `uv venv --python /usr/bin/python3 /workspace/.deployment-tools/azcli-venv && uv pip install --python /workspace/.deployment-tools/azcli-venv/bin/python azure-cli==2.91.0` and authorize login through `az login --use-device-code --tenant lchtechnologies.onmicrosoft.com --allow-no-subscriptions`. Keep `AZURE_CONFIG_DIR` pointed to the private config directory, then run `python3 scripts/lch_entra_mail_audit.py --live` for read-only verification. This does **not** authorize mail sending in n8n.
