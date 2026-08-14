# GH-20 — Real n8n + Firestore end-to-end runtime evidence

Result: PASS for the private processor runtime path.

## Producer execution
- Dedicated `lch-n8n-firestore` identity is enabled with only `roles/datastore.user` at project scope.
- n8n credential `LCH Firestore Service Account` reports `Connection tested successfully`.
- Both Firestore nodes in live workflow `LCH Website — Firestore Lead Processor` use that credential.
- `Query Pending Leads` ran against the intended named Firestore database and returned the retained synthetic GH-20 document with `automationStatus=pending`.
- `Score Pending Leads` produced deterministic HOT / score 10 / `sales_immediate` / SLA 15 metadata for the synthetic lead.
- `Mark Lead Processed` executed a real Firestore upsert and returned a new Firestore update time with `automationStatus=processed`.
- A second read-only pending query returned `No output data returned`; the processed synthetic lead was no longer eligible for the pending queue.
- The workflow was published as version `GH-20 private Firestore processor`; n8n confirmed the schedule trigger is active.

## Public-path cross-check
- A second synthetic public form submission (`GH20 Scheduled`) was accepted by the public `ais-pre` site under the strict live rules.
- No public n8n ingress was introduced; the production path remains public website -> Firestore -> private n8n polling.

## Credential hygiene
- Two unused service-account keys created during download troubleshooting were revoked.
- Exactly one service-account key remains active: the one stored in n8n.
- The private-key value was never printed, committed, or returned to the harness.

## Remaining release hygiene
- The downloaded JSON copy on the user's Mac must be deleted and the local clipboard cleared before the final independent-verification PASS and `production_transport` release gate.
