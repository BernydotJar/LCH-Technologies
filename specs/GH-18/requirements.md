# GH-18 — Graph state recovery and canonicalization

## Objective
Recover the existing LCH Graph Harness program into a valid `graph-harness.project.v1` contract without fabricating historical events.

## Acceptance criteria
1. Preserve the AI Studio `GH-00..GH-17` status projection as a recovery artifact.
2. Materialize a valid SHIP-mode Graph Harness v1 project and append-only event ledger in `graph/`.
3. Record execution policy: graph mode, engineering reasoning, gated human evaluations.
4. Record recovered product requirements and architecture, including the n8n follow-up requirement delta.
5. Validate the project and ledger using Graph Harness runtime at pinned harness commit `477bdcc3d390c30eb49d823e5c7fd105fee2cc4d`.
6. Record repository branch/HEAD and public-site verification evidence in persistent progress artifacts.
7. Do not modify application production behavior in this node.

## Non-goals
- Reconstructing a missing historical event chain.
- Claiming recovered legacy DONE statuses have v1 ledger evidence.
- Implementing n8n integration.
