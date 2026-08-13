# GH-18 Producer Report

## Recovered state
- Legacy AI Studio graph recovered with `GH-00..GH-16 = DONE` and `GH-17 = PENDING`.
- No recoverable `graph-harness.event.v1` ledger existed in AI Studio; no historical events were fabricated.
- Recovered product requirements, architecture, and brand-system artifacts are stored under `graph/recovery/`.
- Canonical Graph Harness v1 contract is stored under `graph/`.

## Repository baseline
- Repository: `BernydotJar/LCH-Technologies`
- Baseline HEAD: `76843407459a41761a6da13323d982e089ef31ee`
- Working branch: `feature/graph-n8n-lead-automation`
- Production application code was not modified by GH-18.

## Runtime verification
Pinned Graph Harness runtime: `477bdcc3d390c30eb49d823e5c7fd105fee2cc4d`.

`graph-harness validate` passed with a valid event chain. The authoritative v1 ledger begins with the current user approval and GH-18 lifecycle transitions.

## Public baseline verification
The authenticated browser session reports the public `ais-pre` URL as loaded and complete. It contains the official full logo, official isotipo, official favicon, and the contact form with email and consent controls.

## Open delta
The user has requested durable lead capture plus n8n follow-up. This is represented by GH-19 and GH-20 rather than rewriting the recovered legacy graph.
