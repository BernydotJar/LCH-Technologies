# GH-22 | Independent Verifier — Contract, Browser, and Consent

Evaluator scope: independently exercise the production-shaped LCH site and its existing chat/lead contracts using browser requests, without scraping the form to populate fields and without sending synthetic contact data during the semantic preparation tests.

## Results
1. **Functional:** Playwright against Node static/API staging on port 4242: two viewports 390px and 1365px. One volunteered natural-language statement prefilled all seven supported fields, with correct values; no JavaScript errors.
2. **Privacy:** The helper's two modes (one-sentence and guided) performed zero Firestore writes and zero `/api/chat` POST while collecting personal contact details.
3. **User authority:** When a human had already edited `nombre`, the assistant's suggested `nombre` did not replace it. The final `consentimiento` checkbox remained unchecked.
4. **Schema:** The form exposes `data-semantic-tool=prepare_lch_contact_form` and exactly the seven declared fields. `consentimiento` has no semantic-write field and is not part of the tool input schema.
5. **Regression:** Prior Donna business-knowledge API, message streaming lifecycle, contact handoff, product facts and Escape interactions passed on both mobile and desktop using the unchanged baseline browser suite.
6. **Build integrity:** 54/54 Node tests passed; TypeScript passed; `npm run check` passed with seven public Firebase environment parameters present. The default `build` script now executes the config guard before invoking Vite.
7. **Production incident:** A synthetic write in recovered public LCH returned Firestore success and a reference. The new semantic build must still be published and verified under HTTPS.

## Risk disclosure
- Deliberately local guided interpretation is not a new generative model; non-obvious names and organizations may remain incomplete and must be reviewed.
- Normal business chat still uses the LCH same-origin API; only semantic contact data collection bypasses the chat API.
- No commercial email or Teams alert has been configured as part of GH-22.
- No automatic acceptance of personal-data consent, no remote model PII routing, and no arbitrary form-target selectors.

Verdict: **PASS** for GH-22 scoped quality. Production transport gate remains separate and pending.
