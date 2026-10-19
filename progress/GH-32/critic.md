# GH-32 — Critic / Red Team review

**Verdict: PASS for code readiness; external production transport must remain gated.**

Adversarial concerns considered:

1. **False customer promises.** The old hero implied an unsupported five-day-to-twenty-minute case. The new hero omits specific unverified ROI numbers and makes only approach-level statements.
2. **Privacy and misleading AI.** New challenge selection never enters /api/chat, browser storage or Firestore. Donna is opened only on explicit click, without automatic submission or fabricated generated responses.
3. **Consent boundaries.** The only Contact field prepared by the CTA is one whitelisted interest (not a message, email, or consent). The existing form still requires user input and express unchecked-to-checked consent.
4. **Tracking overcollection.** Only the four-value challenge identifier is eligible for an event, built through existing `track` whitelisting and not emitted without prior consent.
5. **Regressions.** Existing chat, form guide, user-edit priority, reset, language and dark-mode E2Es all passed. No DNS, M365, n8n or Firebase rule changes.
6. **Accessibility.** Native buttons support keyboard interaction, pressed states and visible focus; reduced-motion skips panel transitions, and no horizontal overflow at desktop/mobile.
7. **Deploy coupling.** A separate GH-32 release avoids making the landing hostage to GH-31 GoDaddy/Cloudflare nameservers, which need preserving Microsoft 365 DNS.
8. **Performance.** Existing frontend code chunks exceed 500kB minified; gzip remains ~172kB for the main JS. Tracked as nonblocking performance follow-up, not misrepresented as optimized.

**Independent verifier condition:** Need a real immutable Node server build, public `/health` release SHA, Donna response, exact public asset fingerprint and public browser proof before public PASS. Do not mark GH-32 DONE merely for this review.
