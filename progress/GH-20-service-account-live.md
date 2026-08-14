# GH-20 — Live service-account prerequisite validation

Result: PASS for the Google Cloud identity prerequisite; n8n credential binding remains user-authenticated work.

## Producer / external validation
- Dedicated service account `lch-n8n-firestore` exists and is enabled in project `rag-municipalidades`.
- Project IAM shows exactly the intended workload role for this identity: `Cloud Datastore User` (`roles/datastore.user`).
- The account had no user-managed keys before setup.
- Exactly one JSON private key was created and independently confirmed active in the Google Cloud service-account key list.
- The private-key material was not read, copied into repository state, printed to logs, or exposed through browser automation output.

## Fresh repository verification
- `npm test`: 20/20 PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `git diff --check`: PASS.
- Secret scan: PASS; no private-key marker or generated key identifier persisted in source artifacts.
- Private Firestore processor still has exactly two Firestore nodes, both `authentication: serviceAccount`, with no exported credential binding.

## Critic / Red Team
- PASS: least-privilege project role is narrower than reusing a broad default Firebase/Admin identity.
- PASS: only one user-managed key exists, limiting key sprawl.
- PASS: no public n8n ingress is required by the production path.
- BLOCKED: n8n restarted successfully but the browser session expired. The editor redirects to Sign in and REST calls return 401.
- BLOCKED: n8n's Google Service Account credential requires the private key to be pasted by the authenticated user; the harness will not extract that private key from the downloaded local JSON file.

## Remaining lifecycle
1. User signs in to the local n8n editor without sharing credentials.
2. User pastes only the private key locally into the already-prepared Google Service Account credential; service-account email and credential name are prefilled.
3. Harness saves/tests the credential, binds it to the private processor, runs the retained synthetic pending lead, verifies `automationStatus=processed`, activates the workflow, and completes independent/release-gate evidence.
