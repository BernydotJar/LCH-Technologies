# GH-18 Critic / Red Team Review

## Findings

### 1. Source-of-truth ambiguity — FAIL until fixed
The public AI Studio app and the GitHub repository are separate code stores. A reader could incorrectly infer that a GitHub commit automatically updates the `ais-pre` deployment. The recovery must explicitly state that GitHub is the canonical engineering source going forward, while AI Studio is currently a manually synchronized deployment mirror.

### 2. Legacy security status can be misread — FAIL until fixed
The recovered legacy graph marks GH-12 "Security and Firebase-rule verification" as DONE, but the currently observed rule allows anonymous document creation with `allow create: if true`. Reads/updates/deletes are correctly denied, but write validation and abuse controls are not sufficient for a production lead endpoint. The v1 graph must preserve GH-12 only as historical status and carry the current risk into active work.

### 3. Historical evidence provenance — PASS
The recovery does not fabricate prior events and explicitly labels legacy statuses as non-ledger-backed.

### 4. Runtime contract — PASS
The new project validates against the pinned Graph Harness runtime and the new event chain is internally valid.

## Verdict
REPAIR REQUIRED for findings 1 and 2 before the `recovery_integrity` gate can pass.
