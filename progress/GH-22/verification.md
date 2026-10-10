# GH-22 | Verification and Independent QA

## Environment
- Git base: main `213135e2bd26e7a11a1dac936b9b640c584b7dc7`.
- Code prepared in dedicated branch `feature/gh22-donna-semantic-contact`.
- Server: LCH same-origin Node, local staging `http://127.0.0.1:4242/`.
- Form: seven-field semantic schema, Firestore write only from `Contact.tsx`.

## Deterministic tests
- `npm run test`: **54/54 PASS**, including ten new GH-22 tests for field contract, extraction, guided answers, unknown keys, consent protection, human edit priority, PII deduplication, and fail-closed build command.
- `npm run typecheck`: PASS.
- `npm run check`: PASS including the guarded production build.
- `dist/server.mjs`: built successfully with the seven Firebase public SDK parameters; no public n8n webhook.
- `git diff --check`: PASS.

## Browser E2E, independent verifier
Command: `NODE_PATH=/workspace/projects/LUMA/node_modules LCH_SMOKE_URL=http://127.0.0.1:4242/ node scripts/semantic-contact-smoke.cjs`.

- Mobile 390px: full-sentence profile, semantic tool identity, all fields and consent guard PASS; zero JavaScript errors, no unsolicited network writes.
- Desktop 1365px: identical PASS; zero JavaScript errors, no unsolicited network writes.
- Guided mobile: missing-fields turn-taking, email, organization, role and interest inputs, existing human-entered name preserved, consent unchecked; **0 API and Firestore POST**.
- Original `scripts/donna-smoke.cjs` regression: 390px and 1365px PASS for product knowledge, original same-origin chat API, consented handoff and keyboard closing.

## Firebase incident recovery (already public)
- Original production probe: generic contact failure; page error `Missing contact integration configuration: projectId`, no persistence attempt.
- Configured local preview: Firestore HTTP 200, confirmation receipt.
- Recovered public release `213135e2...-contact-firebase-restored`: Firestore HTTP 200, contact confirmation reference `I1UQAFRO5U`.
- Production release SHA stays `213135e2...` because the published source commit did not change; immutable runtime release directory suffix distinguishes the corrected bundle.
- Two synthetic QA records were created to verify real capture; these contain only test identities and should not be treated as sales opportunities.

## Remaining independent release verification
- The GH-22 merged code must be deployed as an immutable build with the same Firebase configuration.
- Public HTTPS health, semantic contact UI and one synthetic end-to-end write must be verified after cutover.
- Commercial email alerts and live generative LLM integration are outside GH-22 scope.
