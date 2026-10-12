# GH-30 — release quality verification

- Azure CLI `2.91.0` installed into an isolated venv; read-only `az account show` confirms the expected LCH tenant, and `python3 scripts/lch_entra_mail_audit.py --live` returned 9 booleans TRUE and `clientSecretCount=0`: `correctTenant`, `singleTenantApplication`, `exactRedirect`, `onlyDelegatedMailSend`, `appAssignmentRequired`, `onlyContactoAssigned`, `onlyContactoConsent`, `maxOneRotatableSecret`, and `readyForMailboxOAuth`.
- Source: pinned 13-node LCH workflow SHA-256 `c419f62402ad6758d9cbef605b3c981f404a66e110d23d488bcca080bf7da1f0` matches baseline. Workflow is inactive and has activation placeholder.
- Python unittest covers 10 Entra least-privilege fixtures and 11 workflow import guard fixtures; all 21 PASS. Bash syntax PASS.
- CI checks the same pinned workflow checksum and runs both negative fixture suites; it cannot perform Mac-host import, OAuth grants or inbox receipt tests.
- Runtime binaries, Azure CLI credentials and config are **not** in the repository. App Client ID and directory object IDs in docs are public identifiers, not OAuth secrets.
- Need to run fresh full LCH regression, TypeScript and guarded production build before merge. GitHub PR tests must also pass.

## External release proof not yet available

Mac n8n LCH import not yet verified. Google service identity is not credential-bound in n8n; Outlook OAuth2 sign-in not completed. No four-inbox Outlook receipts or Firestore accepted state proven. The execution gate remains blocked. No changes to public website runtime or Firebase plan are required.

## Final verified checks — 2026-10-12

- Executable `python3 -m unittest tests.test_lch_entra_mail_audit tests.test_lch_n8n_workflow_guard -v`: **21/21 PASS**.
- `bash -n scripts/lch-n8n-mac-bootstrap.sh`: PASS.
- `python3 scripts/lch_n8n_workflow_guard.py source workflows/n8n/lch-contact-mail-spark.workflow.json`: `guard=pass`, evidence digest `c79a2b7c0c15f23d5cb4ca224687f8a0550f05cb72abb5b182e272b8eadc4f0e`.
- Pinned `sha256sum --check`: PASS (`c419f62402ad6758d9cbef605b3c981f404a66e110d23d488bcca080bf7da1f0`).
- **Real read-only** `LCH_AZ_BIN=.../az python3 scripts/lch_entra_mail_audit.py --live`: `readyForMailboxOAuth=true` with exactly one contacto user assignment, own-mailbox delegated `Mail.Send`, single tenant, correct Mac callback, `clientSecretCount=0`.
- `npm run test`: **91/91 PASS**. `npm run typecheck`: PASS. `npm run build:deploy`: PASS (standard Vite chunk-size warning, Donna API bundled).
- Only Git-tracked source/docs/scripts/tests will be published; local Azure CLI installed under `/workspace/.deployment-tools/azcli-venv` and its authenticated config under `/workspace/.deployment-tools/azcli-config` are explicitly **excluded** from Git.
- Production mail remains blocked: no Mac LCH import proof, no Google/Outlook n8n encrypted credentials, no four-inbox receipts.
