# GH-30 — controlled Mac n8n handoff and Microsoft Entra mail consent

The user requested committing and pushing all LCH work related to the Spark → Firestore → n8n → Outlook lead-notification integration. GH-29 IAM and Entra setup is already merged in `main` (PR #30). This change promotes follow-up work in one clean feature branch based on current `origin/main`, without duplicating GH-29 commits.

## User constraints
- `contacto@lch-technologies.com` is a **separately licensed** mailbox and must be the OAuth principal and From identity.
- The only four recipients are contacto, eduardo, lina, sara as previously approved.
- Firebase remains Spark; no Cloud Functions/Blaze, no purchasing other services.
- Lina's existing n8n automation must never be edited or disabled.
- Neither Cloud Sandbox nor Mac n8n may email before a real acceptance and four-inbox delivery gate.

## Change scope
- Entra registered app, tenant identity, single-tenant, delegado `Mail.Send`, individual consentimiento for contacto only, enforced assignment to contacto, correct Mac localhost callback, zero application secrets currently active; a read-only Azure CLI audit validates these facts.
- A guarded Mac n8n bootstrap provides dry-run, deterministic hash over an inactive 13-node workflow, duplicate-detection guard, protected SQLite backup and an inactive import mode. It fails closed when LCH exists or Lina is not unique.
- Azure CLI v2.91.0 is installed locally in isolated `/workspace/.deployment-tools/azcli-venv`. Its auth cache is under `/workspace/.deployment-tools/azcli-config` mode 700. None of these local binaries, OAuth caches or device codes belongs in Git.
- Cloud Sandbox n8n and Mac n8n are separate instances, each with its own `localhost:5678`. Cloud Sandbox LCH remains inactive; the Mac is the proposed selected executor due to OAuth redirect and authenticated browser.

## Gates
- Required source quality: Entra audit 10 tests + workflow guard 11 tests + shell syntax + workflow checksum; full LCH test suite, TypeScript and build; actual live authenticated read-only Entra audit via Azure CLI.
- Release: ONLY after Mac n8n import with Lina invariant, Google/Outlook encrypted credentials and scoped consent, a consented QA Firestore record, Graph send success, four independent mailbox receipts and no duplicate on replay. **Do not mark delivery as done on source checks alone.**
