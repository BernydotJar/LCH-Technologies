# LCH + Donna — Engineering & Release Handoff

## Scope and source provenance

**Source prototype:** `BernydotJar/Cadre_AI_Chatbot` (Donna r15 / PX6, originally shipped on Vercel at `https://cadre-ai-chatbot-tawny.vercel.app/`). The reference repository was inspected at `4a3cf2e` on 2026-10-09. The source proof of concept stays independently hosted and was not modified.

**Target:** `BernydotJar/LCH-Technologies` on `https://lch-app.cloud`.

This release **adapts Donna's verified-knowledge policy, deterministic intent routing, safe handoff, rate limiting, timeouts, state recovery, reduced-motion-aware presentation and quick prompts**. It does **not** copy the entire Next.js app, its Cadre-branded data, OpenRouter secrets or Vercel runtime.

## Architecture

```text
LCH SPA (React 19 / Vite)
  |
  +-- DonnaChat (LCH brand, floating launcher)
       |-- Quick prompts and free text, max 2,000 chars
       |-- POST /api/chat (same origin, JSON, no CORS)
       |     |
       |     +-- Node LCH release server (dist/server.mjs)
       |           |-- Body bound to 64 KiB; max 20 turns
       |           |-- Origin + method + content-type checks
       |           |-- Process-local abuse limiter
       |           |-- Donna deterministic policy
       |               |-- Prioritized account/pricing/claims boundaries
       |               |-- Approved public LCH knowledge and links
       |               |-- Single clarification or honest handoff
       |
       +-- Explicit "Continuar con una persona" action
                |
                v
          Contact (existing LCH form)
            |-- interest + last message prefilling, editable
            |-- independent explicit consent remains required
            +-- Firestore demoRequests create -> private n8n classifier
```

**No conversation data is persisted in the chat server or sent to Firestore automatically.** The visitor chooses to transfer the latest user message and inferred interest into a draft form, can edit/remove it, and must accept contact consent before submitting.

Donna responds in **grounded/curated demo mode**, with no live LLM in this release. This is consistent with the original POC's explicit mock/live provider distinction. Do not claim a live generative model is being used. OpenRouter remains exclusively in the original POC; no Cadre credentials or endpoints are reused.

## New code / ownership

- `src/donna/knowledge.ts`: reviewed LCH-only statements, allowed links, quick prompts and lead interests.
- `src/donna/engine.ts`: route, normalize, validate, boundaries, fallback/clarify policy.
- `src/components/DonnaChat.tsx`: accessible responsive launcher, conversation composer, retry, handoff.
- `src/App.tsx` + `src/components/Contact.tsx`: ephemeral explicit handoff and form prefilling.
- `server/handler.ts`: production same-origin Node API + static file handling.
- `server/entry.ts` + `scripts/build-server.mjs`: immutable Node bundle; `npm run build` creates both site and server.
- `tests/donnaEngine.test.ts`, `tests/donnaServer.test.ts`, `scripts/donna-smoke.cjs`: regression and browser E2E.

## Production/deploy contract

**Never deploy a raw Vite build lacking Firebase config.**

1. Use the already configured ignored `.env.production.local`; `npm run build:deploy` enforces the seven public Firebase SDK parameters and blocks a public n8n webhook.
2. Run `npm run check` (all tests, typecheck, browser and Node build).
3. Run `npm run build:deploy` and confirm **`dist/server.mjs`** exists.
4. Stage the entire `dist/` folder as a new immutable release and preserve the current release for rollback.
5. In the existing supervisor config, set the program command to `node <new release>/dist/server.mjs`, `DIST_DIR=<new release>/dist`, and `RELEASE_SHA=<merged commit>`.
6. Supervisor reread/update, then verify `/health` on 14175 and on `https://lch-app.cloud/health`. Check chat POST and contact form in production.
7. To roll back, restore the previous supervisor configuration and reload; no database migration was performed.

## Independent verification / release gates

- Donna route and boundary unit tests: greeting, Spanish normalization, AI, automation, software, cloud, LUMA, I-DO, Evidence AI, unsupported pricing and security claims, private requests, clarification, malicious URLs.
- Node HTTP tests: same-origin 200, off-origin 403, JSON requirement 415, bad payload 400, oversized request 413, GET method 405, spam 429, safe static serving, and release health.
- Playwright headless mobile (390px) and desktop (1365px) smoke with **real local POST /api/chat**: prompts, rendered reply, no viewport overflow of panel, no double-consent, lead interest/draft prefill, keyboard Escape and reset, product knowledge.
- Production Firebase capture and private n8n lead classification were tested separately in LCH Contact V2. No migration is required for Donna.
- No user-identifiable production chat data was written to Firestore during these checks.

## Known limitations / next gates

1. **Production scale:** the abuse limiter is process-local and initially keys by direct peer IP. Behind a trusted Cloudflare Tunnel, configure a verified per-client identity only after independently validating that ingress replaces incoming headers. For paid/large-scale traffic, use a centralized limiter and App Check or Turnstile where appropriate.
2. **Knowledge scope:** grounded responses use only the published LCH website. There is no RAG retrieval, account access, meeting booking, price quotation, or authenticated CRM in Donna v1.
3. **Commercial notifications:** the existing n8n classifier records priority and queues, but a separate authenticated delivery channel to a sales person has not been configured.
4. **Privacy:** formal retention/legal controller details and chat analytics are deferred to a dedicated policy review. Do not send conversation content to unapproved analytics.
5. **Product path:** once LCH public product knowledge changes, update the curated facts and URLs with evidence, run adversarial regression and re-release.

## Evidence / roll-forward invariant

- Donna POC remains independent and responsive in Vercel.
- LCH root retains its current brand, sections, product preview and Firestore lead form.
- `/health` and `/api/chat` share the same LCH origin and supervised process.
- This is a targeted feature merge, not a monorepo or framework migration.
