# GH-24 — Donna form completion repair

## Reproduced defects
The published version only copies Donna's local draft to the React form upon an explicit review handoff. Natural-language Spanish introductions could attach a company to a surname, omit organization when a role is followed by "en", or include an identity statement in the goal. A second Donna email correction was blocked because the form only filled empty fields.

## Expected behavior
A user can open Donna from the form, continue from already-entered fields, provide one natural-language statement, and see allowed fields populated **while the chat remains open**. Donna can revise its own proposals, but manual form edits always win. Reset clears Donna-owned values only. Consent and submission remain exclusively human.

## Destination and boundary
The deployed Firestore client targets Firebase project `rag-municipalidades`, named database `ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7`, collection `demoRequests`. Private n8n scoring consumes pending documents; no Microsoft 365 notification recipient has been configured.

## Validation
Unit tests cover Spanish parsing, guided cross-field declarations, assistant corrections, human edit priority and consent invariants. Playwright `scripts/donna-live-form-smoke.cjs` covers 390/1365px and both form-first/launcher-first paths. No Firestore/LLM authorization, migration or automatic send is included. Complete build, browser and public release gates remain pending.
