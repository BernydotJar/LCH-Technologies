# GH-20 — Critic / Red Team final review, revision 2

Result: PASS on architecture and runtime behavior; final local-secret cleanup is required before release-gate PASS.

- Production n8n has no public ingress requirement.
- Firestore is the durable queue and public reads/updates/deletes remain denied.
- The service account is dedicated and least privilege (`roles/datastore.user`), rather than reusing broad/default project identities.
- Live n8n Firestore nodes use service-account authentication and the credential connection test passes.
- Real pending query, deterministic scoring and document-specific update all passed against the intended named database.
- The synthetic document moved from pending eligibility to processed state.
- The schedule-trigger workflow is published.
- Two unused cloud keys were revoked; only the key stored by n8n remains active.
- No private-key material appears in Git or Graph Harness evidence.

Release must remain blocked until the downloaded local JSON copy and clipboard residue are removed on the user's Mac.
