# GH-21 | Product/CX critic review (before fixer)

Scope source: `specs/GH-21/donna-proactive-orb.md`. Baseline: LCH Donna v1 `a23f41a`.

## Independent-model status
IBM Granite 3.3 2B exists locally via Ollama. The initial inference attempted the reviewed excerpts but failed with HTTP 500; the kernel log confirms an out-of-memory kill of `llama-server`. **Granite result = INCONCLUSIVE, not PASS.** No model-generated findings will be represented as verified evidence.

## Source-based UX/architecture critic

1. **MEDIUM — launcher layout shift.** The subtitle switches between short and long action labels and the launcher width follows content. As the right side is anchored, its left edge can jump while a user is scanning the page. *Minimal fix:* fixed responsive launcher width with truncation; the orb remains anchored.
2. **LOW — welcome density on mobile.** A new rotating idea card plus four static quick prompts may make the first usable action less prominent in the 390px chat. *Minimal fix:* show only two evergreen quick prompts; the rotating card covers the broader catalog.
3. **LOW — unnecessary cognitive framing in activity label.** The header says `Analizando tu pregunta…`, though this release uses deterministic grounded retrieval. *Minimal fix:* use `Preparando una respuesta…`.
4. **MEDIUM — incorrect grounded target.** The first browser verification found the Evidence AI invitation resolving to the generic LCH overview because its initial wording matched the longer general keyword. The Graph Harness recorded a localized failure and revision increase. *Minimal fix applied:* rewrite the invitation and related follow-ups to include the specific Evidence AI topic; assert the exact expected interest in unit tests.
5. **CHECK — accessibility/interaction.** Explicit state gating for hover/focus/draft/reduced motion/hidden tab exists in source. Verify in a real browser, including pause after focus, manual-next in reduced motion and active-phase orb. No automated pass assigned yet.
6. **CHECK — truth/consent.** All suggestion copy is LCH-owned and sent only on button activation. After grounded answers, chips are generated from an allowlist; for pricing/redirect no suggestions. Independently verify public chat never writes Firestore or auto-submits contact.

## Decision
**PASS WITH FIXES APPLIED, pending final automated browser and release verification.** No new API, datastore, provider or secret scopes are authorized.
