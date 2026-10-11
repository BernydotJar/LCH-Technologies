# GH-29 | Firebase Spark named-database IAM identity, verification, admin gate

## Purpose
Continue LCH email integration without Cloud Functions/Blaze. Create a dedicated Cloud IAM identity for Firestore consumption and notification-state CAS writes, preserve legacy LCH automation SA and n8n Lina workflow, and validate least-privileged **direct project IAM** with independent tests. Do not expose or programmatically export private keys, OAuth refresh tokens or prospects.

## Exact target
- Project `rag-municipalidades`, Firestore database `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7`.
- SA `lch-lead-mail-n8n@rag-municipalidades.iam.gserviceaccount.com`.
- Role `roles/datastore.user` conditioned on exact database resource.name.
- Zero additional direct project role bindings, no private keys provisioned by this release.

## Evidence and gates
Quality gate: Google IAM read-only audit PASS, unit tests PASS, full LCH 91 tests PASS, TypeScript/build PASS, existing workflow inactive; CI PASS.
Live gate: blocks until secure admin console for the **selected** Cloud Sandbox n8n exists, Google service key or keyless identity is authenticated, Outlook delegated OAuth2 with appropriate Send As is granted and 4 actual recipients' mailbox receipts verified. Distinguish Mac n8n from Cloud Sandbox n8n; never activate both.
