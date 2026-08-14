# GH-18 Fixer Report

The Critic findings were repaired without changing production application behavior.

## Fixes
1. `graph/recovery/architecture.md` now explicitly defines GitHub as the canonical engineering source and AI Studio as a separately synchronized deployment mirror.
2. The recovered GH-12 DONE status is explicitly identified as historical/non-ledger-backed and not current security approval.
3. `graph/recovery/open-risks.md` records public write abuse, deployment-source drift, and local n8n availability as active risks owned by GH-19/GH-20/GH-17.
4. Automation direction is explicit: Firestore persists first; n8n orchestrates follow-up; automation failure must not lose a persisted lead.

No historical events were synthesized and no legacy status was rewritten.
