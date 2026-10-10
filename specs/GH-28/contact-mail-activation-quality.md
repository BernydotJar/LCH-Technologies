# GH-28 — n8n LCH mail hardening, real-instance verification and release controls

## Business intent
User instructed to finish the Firestore→n8n→Outlook four-recipient notification, test and document without upgrading Spark. Four fixed recipients: contacto@lch-technologies.com, eduardo.sacahui@lch-technologies.com, lina.saldarriaga@lchtechnologies.onmicrosoft.com, sara.saldarriaga@lchtechnologies.onmicrosoft.com.

## Source findings
Two separate n8n instances exist: Mac Chrome `http://localhost:5678` shows Lina alone and the empty Credentials state; Cloud Sandbox `127.0.0.1:5678` has the LCH workflow installed inactive and zero credentials plus the live Lina process. Mac and Sandbox localhost are not the same endpoint. The authenticated Mac credential UI requires Microsoft Outlook OAuth2 Client ID and Client Secret and advertises callback `http://localhost:5678/rest/oauth2-credential/callback`. No prior Microsoft/Google grant is present there. No credentials have been issued, pasted or exposed.

## GH-28 implementation
- Retain existing Firestore Spark named DB and n8n architecture, with exact recipients and manual consent unchanged.
- After Firestore optimistic CAS claim, insert a Code node requiring a matching `notification.leaseId` and state `sending` from the persisted Firestore response before Outlook. CAS failed/errored items must not mail.
- After native Outlook send, insert a Code node requiring literal `{success:true}` as returned by the installed n8n v2.39.6 Outlook `send.operation.js`, or do not ACK. Provider errors must not become false accepted Firestore records.
- Separate dead-letter branch catches >=7 attempts with an expired lease and writes `notification.state=needs_review` through a Firestore conditional PATCH only; never emails those records.
- Bounded send attempts, lease, optimistic CAS, source/consent/activation predicates, PII minimization and error categories remain intact. No public webhook, no additional container, no Cloud Functions, no Firebase billing.
- Add a **read-only** release preflight that checks installed n8n workflow version, credential binding, activation timestamp and active flag without reading secret values. Preflight never claims successful inbox delivery.

## Quality and operational gates
A. Unit tests of node topology, consent, four-recipient whitelist, CAS failure, Outlook failure, expired leases, dead-letter branch, preflight with fake SQLite metadata.
B. Full TypeScript, frontend tests, guarded production build, real n8n CLI import **inactive**, original Lina row hash unchanged and credential count zero, GitHub Actions pass.
C. External delivery gate remains blocked until a single selected n8n instance has scoped Google Firestore and delegated Microsoft Outlook OAuth credentials, sender/SendAs approval, read/CAS rights, a fresh QA lead after configured activation, Graph provider acceptance and four actual Outlook mailbox receipts, plus host restart check.
