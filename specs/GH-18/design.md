# GH-18 — Design

## Recovery model
The AI Studio project contained a legacy JSON status projection and visible specification documents, but no recoverable append-only `graph-harness.event.v1` ledger. The canonical repository will therefore:

- preserve the legacy graph verbatim as a recovery artifact;
- initialize a new v1 project from the recovered current state;
- mark legacy DONE nodes as recovered initial state with metadata explicitly stating that they are not ledger-backed;
- begin the authoritative v1 event chain only with this recovery session.

## Canonical files
- `graph/graph-harness.project.json`
- `graph/graph-harness.events.jsonl`
- `graph/session-policy.json`
- `graph/recovery/*`
- `specs/GH-18/*`
- `progress/*`

## Validation
Use the pinned Graph Harness runtime checkout at commit `477bdcc3d390c30eb49d823e5c7fd105fee2cc4d` to run `validate`, `status`, and `ready` against the LCH project files.

## Governance
The current user instruction is the human authorization to continue the existing Graph Harness SDLC program under graph execution with engineering reasoning and gated human evaluation. External production effects remain separately gated.
