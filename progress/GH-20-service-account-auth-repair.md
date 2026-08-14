# GH-20 — Service-account authentication repair

## Critic finding
The private Firestore processor was designed to use a dedicated least-privilege service account, but the versioned n8n workflow still declared `googleFirebaseCloudFirestoreOAuth2Api` on both Firestore nodes. That made the approved credential architecture incompatible with the exported workflow.

## Fixer
- Changed `Query Pending Leads` authentication to `serviceAccount`.
- Changed `Mark Lead Processed` authentication to `serviceAccount`.
- Kept credential bindings absent from the exported workflow.
- Kept the processor inactive by default.

## Verification
- `npm test`: 20/20 PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- Independent read-only contract check: exactly two Firestore nodes, both use `serviceAccount`, neither exports a credential binding.
- `git diff --check`: PASS.

## External gate still required
Create the dedicated `lch-n8n-firestore` service account with `roles/datastore.user`, assign its credential inside n8n, run the retained synthetic pending lead end-to-end, then remove any temporary key material outside n8n.
