# GH-20 Tasks — Revision 1

1. Add `automationStatus: pending` to the initial Firestore write and strict create rules.
2. Build credential-free importable `LCH Website — Firestore Lead Processor`.
3. Query only pending leads on a bounded schedule.
4. Prove scorer parity and update-field isolation in tests.
5. Run full test/typecheck/build/audit and secret scan.
6. Import the private workflow into the user's real n8n instance.
7. Assign an authorized Google Cloud Firestore credential without exporting it.
8. Replace project/database placeholders only in the live n8n copy, not the committed template.
9. Execute a synthetic pending lead end-to-end and verify it becomes processed.
10. Verify/deploy the hardened Firestore rules in the live project.
11. Synchronize the updated write contract to AI Studio and verify a real public form submission.
12. Independent verifier repeats production-path checks.
13. Pass `production_transport` gate or record precise external blockers.
