# GH-32 — Producer: commercial landing, exact source

**Date:** 2026-10-19. **Base:** main `013764e36802758a2f9747901917b095b12ac4a8`.
**Branch:** `feature/gh32-intelligent-business-landing`.
**Scope:** commercial UX, not DNS, email, n8n or Firebase backend migration.

## Implementation

- Replaced the technical-first hero with a problem-first value proposition and four deterministic, mutually exclusive visitor intents.
- `OpportunityNavigator` has stateful, accessible selectors with `aria-pressed`, a dynamic explanation, contextual route, existing Donna exploration and an explicit Contact CTA.
- The handoff includes **only** one validated `INTEREST_AREAS` value, not visitor details, fabricated message, consent or an implicit write.
- Donna's new exploration trigger opens the **existing** grounded chat without sending a request, enabling contact guide, writing to Firestore or granting consent.
- All copy uses existing `useLocale` provider for Spanish, English, Portuguese; reduced-motion honored. Existing dark-mode and responsive styles remain.
- Added an allowlisted `opportunity_select` event with one of four identifiers, subject to the **existing optional GA4 consent gate**.
- Existing capabilities, products, governance, forms and private n8n transport were not altered.

## Evidence and screenshots

Native tests: 99/99 PASS. TypeScript PASS. Guarded Vite+Node production build PASS. No direct public n8n webhook. Production dependency audit: **zero high/critical vulnerabilities**. Build warnings about >500kB chunks preexist and are a subsequent performance optimization, not a privacy or production blocker.

Local Playwright against the exact compiled Node server at `127.0.0.1:42132`, synthetic public Firebase build parameters only:
- 1365px and 390px: 4 choices change panel; Donna opens with zero POSTs; only `interes` appears in contact; `consentimiento` stays false; ES/EN/PT and canonical URL remain correct; no horizontal overflow.
- Original Donna form 390px/1365px: direct entry, assistant corrections, user edits win, consent unchecked, reset PASS.
- Site dark mode and Donna dock 320/375/390/768/1365px PASS.
- Screenshot evidence: [desktop](visual/desktop-first-fold.jpg), [mobile opening](visual/mobile-first-fold.jpg), [mobile challenge selector](visual/mobile-explorer.jpg).
- SHA-256 screenshots (desktop / mobile-selector / mobile-open): `b07bcf52a6c51ba9fff073b013f2975d33705dfb4edf43b1860182c5ac050fd1`, `de0cc462715ec0c05e984b4ccbcc2f98d9160611567173cacdf51b4e90bd8592`, `272a8f7dc50528f90b1141954fdf7d06915d6aaae0f5bb5f62c5bf80e65c5449`.

## Release boundary

Existing public host `https://lch-app.cloud` is a separate deployment action. Do not claim production success merely because staging PASS; only a runtime public smoke, exact release SHA and independent production check can satisfy the GH-32 `production_transport` gate. `lch-technologies.com` remains GH-31, pending GoDaddy/Cloudflare DNS and TLS.
