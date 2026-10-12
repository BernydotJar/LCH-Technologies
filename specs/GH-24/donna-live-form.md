# GH-24 — Donna: reliable form completion and lead destination evidence

## Reproduced customer-facing faults

The currently published Donna claims to prepare a form but the content is only transferred to the React Contact form when `Revisar formulario` is pressed. Natural-language extraction also fails on common Spanish constructions:

- `Me llamo Juan Pérez, soy director comercial en Acme...` loses organization.
- `Soy Eduardo Sacahui y trabajo para LCH...` treats the company as part of the surname.
- `Mi nombre es Ana Gómez de Zeta Corp...` treats the company as part of the surname.
- `Necesito automatizar inventarios y me llamo Juan Pérez...` may include contact identity in the business objective.
- A second Donna correction to an existing field cannot replace Donna's previous form value, since `applyContactDraft` only fills blanks. Human edits *should* still take precedence.

The public site is currently `lch-app.cloud` release `5e08515`. Firestore destination from the shipping build: Firebase project `rag-municipalidades`, named database `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7`, collection `demoRequests`. Private n8n lead classification exists; an Outlook notification is not implemented.

## User outcome

A visitor can start Donna from the contact form or floating launcher, describe a real project in their own words, see allowed Contact fields filled **in real time while still chatting**, correct them with Donna and review before giving consent/submitting. No privileged DOM access, no scraping and no automatic lead creation.

## Scope

1. Expand bounded deterministic Spanish slot extraction for work/organization, names, common separators, goal text, safe correction instructions. Reject uncertain data instead of guessing.
2. App-level typed `ContactDraft` bridge: Donna publishes local drafts; Contact receives drafts and fills allowed fields while the visitor is chatting.
3. Track human-edited fields separately from assistant-proposed values; Donna may revise its own fields but never overwrite human input, consent or unrelated form state.
4. Offer `Completar con Donna` entry point near the form header; opening it starts the guided mode, preserving any existing manual fields.
5. Reset clears only values filled by Donna, not manually entered fields or consent. Never POST to chat/Firestore merely to draft.
6. Preserve seven-field schema and privacy filter for private guide history.
7. Validate both interaction paths in real browser (390/1365px), correction and reset, form submission remains human consent only; regression and immutable release with rollback.

## Graph

Producer → CX critic → Fixer → independent browser verifier → quality gate → production gate → append-only evidence.

## Explicit non-goals

No Firebase migration, no new API key or LLM provider, no new email notification recipient, no database schema rewrite, no autonomous form submission.
