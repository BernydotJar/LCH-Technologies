# GH-25 | Independent unit, contract and infrastructure verification

## Deterministic evidence
- `npm run check --prefix functions`: **14/14 PASS**, after a test assertion was updated to read the Firebase v2 SDK's correct `eventTrigger.retry` property.
- Node 22 `node --check` for all notification and trigger files: PASS.
- Firebase SDK actual manifest load: function is exported, event type is `google.cloud.firestore.document.v1.created`, database filter is the deployed named Firestore database, region `us-west1`, retry is enabled and three Secret Manager references are declared.
- Exact approved recipient list, sender mailbox, Reply-To, safe HTML, non-consented rejection, OAuth token flow, Graph 202, Graph 403/429/503, transactional duplicate skip, active lease, retry state, permanent failure state and retry ceiling covered by tests.
- No email was sent in these tests; Graph calls were mocked and Firestore transactions were simulated in memory.

## Infrastructure evidence
- Firebase CLI can list project `rag-municipalidades` and its single named Firestore Enterprise database in `us-west1`.
- Existing website LCH supervision was down (public HTTP 502) when inspected. Starting only the existing `lch-site` supervisord restored local and public HTTP 200 on the previous immutable release `5e08515...`. It did not change the lead database or deploy GH-25.
- `firebase functions:list` could not list functions before this work.
- `firebase deploy --only functions:lch-lead-alerts:lchLeadMailNotification --dry-run --non-interactive`: analyzed the Firebase Functions codebase, then failed at Secret Manager lookup with 403 because GCP billing is disabled. The first `--only functions:lchLeadMailNotification` syntax did not match the configured codebase; the correct scoped syntax is now documented.

## Pending production release
Requires project billing approval, dedicated Microsoft Entra application with appropriately scoped Mail.Send, sender mailbox validation, three secrets securely provisioned, then a scoped deploy and one consented QA lead with delivery confirmation in all four mailboxes.

**No live email receipt was observed.** Do not treat this as a completed integration until operational gate passes.

## Dependency review

`npm audit --prefix functions --omit=dev --json`: 0 vulnerabilities at all severities for the production dependency set at the time of review.
