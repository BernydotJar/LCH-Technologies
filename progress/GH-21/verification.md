# GH-21 | Verification matrix and independent evidence

## Scope and authority
- Source: `specs/GH-21/donna-proactive-orb.md`, LCH-only product content.
- Implementation: CSS signal orb with idle/hover/shaping/responding phases; curated rotating product ideas; safe contextual suggested prompts.
- Core LCH contact/Firestore API and Donna grounded same-origin chat API unchanged.

## Deterministic gates

| Check | Result | Evidence |
| --- | --- | --- |
| 44 existing + new unit/API tests | PASS, 44/44 | `npm run check` test phase and targeted `node --test --experimental-strip-types tests/donnaExperience.test.ts` |
| TypeScript | PASS | `npm run typecheck` (independently rerun after final product changes) |
| Production build with configured Firebase | PASS | `npm run build:deploy`, `dist/server.mjs` produced; safeguard prevents omitted Firebase config |
| Production dependency vulnerability gate | PASS | `npm audit --omit=dev`: 0 high, 0 critical |
| Git diff formatting | PASS | `git diff --check` |
| Historical LCH graph ledger validity | PASS | `python3 -m graph_harness ... validate` |
| Donna baseline E2E, mobile 390px | PASS | `scripts/donna-smoke.cjs` against same-origin Node staging endpoint |
| Donna baseline E2E, desktop 1365px | PASS | `scripts/donna-smoke.cjs` against same-origin Node staging endpoint |
| GH-21 orb, rotation, hover pause, grounded followups, no Firestore POST on mobile | PASS | `scripts/donna-experience-smoke.cjs` observed 390px, both real and accelerated time |
| GH-21 focus pause in desktop with real 5.8s dwell | PASS | Focused dismiss control stayed on original suggestion for 6.5s in headless browser |
| GH-21 reduced-motion orb | PASS | Browser CSS computed animationName = `none`; manual next advances after React state commits |
| GH-21 full new 1365px experience scenario | INCOMPLETE | Combined E2E runs timed out under sandbox load and rapid clock acceleration; no false PASS |
| Granite separate evaluator | INCONCLUSIVE | Local Ollama HTTP 500 and kernel `llama-server` OOM evidence; no generated review |

## Focused repair history
- First mobile vs. desktop scenario found Evidence AI suggestion answered with generic overview due phrase overlap.
- Graph Harness recorded `failure.recorded`, invalidated GH-21 only, incremented its revision, and returned it to `running` via `repair_required`.
- Fix: use specific Evidence AI intent text and assert `expectedInterest` for each carousel suggestion. Five targeted product tests pass.
- Separate false negatives were due to checking React transition before its completion; a real-timing focus test was used to disambiguate.

## Independent verification conclusion
Core browser flows, policy safety, LCH knowledge provenance, keyboard focus pause, reduced-motion accessibility, manual switching and consent boundaries are supported by direct evidence across targeted checks. The combined accelerated-desktop regression and Granite evaluator were **not completed** and must not be presented as green tests.

**Release recommendation: PASS WITH DISCLOSED TEST-GAP.** No new service or data migrations; reversible UI-only enhancement. The public-site transport gate is separate and remains pending until after real HTTPS checks.

## Production post-merge

Public health, targeted Evidence AI API and browser smoke PASS on 390px and 1365px for release 3583c340. See `progress/GH-21/public-validation.md`. The standalone combined accelerated experience matrix remains disclosed as INCOMPLETE.
