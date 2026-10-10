# GH-26 — Reuse existing n8n for LCH lead-mail automation

## User request
Keep Firebase **Spark** (no billing or Functions), reuse existing Cloud Sandbox n8n container if useful and enable email notification to exactly:
- contacto@lch-technologies.com
- eduardo.sacahui@lch-technologies.com
- lina.saldarriaga@lchtechnologies.onmicrosoft.com
- sara.saldarriaga@lchtechnologies.onmicrosoft.com

Do not disrupt Lina's n8n workflows or introduce an additional email sender while the Cloudflare Worker remains undeployed. Use graph quality gates and evidence.

## As-built prerequisites
- The existing dedicated n8n 2.39.6 container `n8n-lina` was stopped, restored safely and answers /healthz.
- Existing `Lina Numerología — Agenda Orchestrator` workflow remains unchanged. No credentials for Google Firestore or Microsoft Outlook are present in this runtime.
- LCH writes to Firestore named DB `rag-municipalidades/ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7/demoRequests` and `createdAt` uses Firestore `serverTimestamp()`. Browser writes only allowed fields with manual consent.
- Old LCH lead-scoring n8n workflow source exists as an *inactive template*, not installed in this runtime; new email workflow must use a different ID and remain inactive until configured.

## Design
1. Inactive n8n Schedule Trigger every 5 minutes. Startup/activation Code node fail-closes until a real UTC activation timestamp is configured, preventing old QA leads from being mailed.
2. Native Google Firebase Cloud Firestore query in the named database, raw wire format, newest 40 contacts since activation timestamp; authorization with a dedicated Google service account OAuth2 credential holding only required Firestore IAM.
3. Code node accepts only `source=website`, explicit `consentimiento=true`, valid contact details, required fields, valid email and known interests, no already accepted/blocked records, active lease or over-retried lead. Generates a single fixed four-recipient HTML email with escaped data and a stable `x-lch-lead-id`.
4. CAS `PATCH` to Firestore REST (`currentDocument.updateTime`), using the dedicated `googleApi` credential in n8n HTTP Request nodes and `notification` updateMask only. If claim fails, stop before sending.
5. Outlook `message/send` using a manually consented sender credential scoped to `contacto@lch-technologies.com`, no unscoped application Mail.Send grant. Send exactly one email to four addresses and set prospect Reply-To.
6. Re-read Firestore document after Outlook send, verify the lease, CAS PATCH notification `state=accepted` only after the native Outlook node returns success. A crash after send and before ACK remains an at-least-once duplicate risk; source lead-id identifies it.
7. No webhook, no public n8n editor (still localhost), no automatic consent or exposed credentials, and no changes to the LCH frontend, rules or n8n Lina workflow.

## Quality gates
- 100% JSON structure/unique-identity/acyclic graph/safe-recipient checks in CI.
- Execute Code node filter formatter with simulated Firestore wire records to verify consent, cutoff and HTML safety.
- Import the workflow as **inactive** into existing n8n 2.39.6 and verify persistence and unchanged Lina workflow, without sending any emails.
- Production gate requires n8n uptime guarantees, Firestore service-account credential and Outlook delegated credential configured, verified sender permissions, test lead after activation, Graph 202 and human verification of receipts in all four inboxes.

## Operation note
Cloudflare Worker GH-25 is a separately merged but **not deployed** alternative. Only one external lead-email automation must be activated at a time. The local n8n container can be restarted after sandbox recreation but uptime is not guaranteed without dedicated process supervision.
