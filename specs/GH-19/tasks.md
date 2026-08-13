# GH-19 — Tasks

1. Approve the GH-19 scope against the user's Firestore+n8n direction.
2. Implement pure lead contract validation/normalization and deterministic scoring.
3. Implement bounded best-effort webhook notification.
4. Update Firestore persistence to persist first and notify n8n second.
5. Harden canonical Firestore create rules without enabling public reads.
6. Create a credential-free importable n8n lead-intake workflow.
7. Add contract/unit tests and documentation.
8. Run typecheck and production build from a clean dependency state.
9. Import workflow into the authenticated local n8n instance.
10. Execute valid/invalid representative webhook tests.
11. Critic/red-team reliability, security, idempotency, CORS, and failure behavior.
12. Repair findings.
13. Independently rerun tests/build and n8n contract tests.
14. Evaluate implementation-quality gate, persist evidence, commit/push through authorized mechanisms, checkpoint, and select the next ready node.
