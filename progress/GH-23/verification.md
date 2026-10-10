# GH-23 — Verification record (staging)

## Scope
Donna browser exploration → same-origin `/api/chat` → grounded LCH response OR explicit contact intent → local semantic draft → human review in existing Contact form. No Firestore schema or credentials changes.

## Code/contract
- Unit and integration tests: **63/63 PASS** (`node --test --experimental-strip-types tests/*.test.ts`).
- TypeScript `tsc --noEmit`: **PASS**.
- Guarded `npm run build:deploy`: **PASS**, seven Firebase config fields validated, `dist/server.mjs` bundled, no new dependencies.
- `git diff --check`: **PASS**.
- New `tests/donnaConversationPolicy.test.ts`: direct intent vs ordinary questions, fallbacks, honest pricing, guidance copy, private history filtering, and verified contact instructions.
- A GH-21 legacy assertion was updated to permit **grounded clarification chips**, while preserving no-suggestion outcomes for pricing or privacy boundary declines.

## Independent browser execution, immutable candidate
Staged process: `http://127.0.0.1:4252/`, source release `gh23-final-test` (exact final Vite and Node bundles).

1. **GH-23 new suite mobile 390px PASS:** unknown query gives topic chips, no inline contact sales link, exactly one primary CTA, started guide has no `0 datos` copy or duplicated question. Returning from local contact to a product question sends an API body **without** private name or guided prompts. Direct `Quiero hablar con el equipo` triggers guidance with zero API/Firestore POST. Pricing answered candidly without forced lead.
2. **GH-23 new suite desktop 1365px PASS:** same scenarios, no page errors, chat inside viewport.
3. **Donna baseline `scripts/donna-smoke.cjs` PASS** at both widths: grounded API and product knowledge, direct-form handoff, unchecked consent, keyboard Escape, 0 page errors.
4. **GH-22 semantic `scripts/semantic-contact-smoke.cjs` PASS** at both widths and guided/private-data scenarios: exactly seven contract fields, user-edited values preserved, consent unchecked, 0 undesired API/Firestore POST.

### Test harness adjustments
- Existing baseline used the old stacked `Continuar con una persona` CTA, now replaced by the `donna-contact-direct-link` secondary text route.
- Existing semantic E2E expected the old `6/6 datos` counter, now `Datos listos`.
- An initial GH-23 test assumed 0/6 despite the preceding approved IA answer correctly prefilling interest (1/6); fixture expectations were repaired to 1/6 and 3/6 after first+last name.
- The first semantic regression timed out starting Chromium under sandbox contention; a single retry with the same candidate passed all checks. No product defect was inferred from the timeout.

## Production gate
Still pending real HTTPS after PR merge and immutable release deployment. Prior production release remains active until cutover.
