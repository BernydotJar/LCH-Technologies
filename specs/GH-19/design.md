# GH-19 — Design

## Submission sequence

```text
Contact form
  -> submitDemoRequest()
     -> validate/normalize request
     -> Firestore addDoc(demoRequests)
     -> obtain document id (leadId)
     -> POST best-effort event to configured n8n webhook
     -> return persistence + automation result
  -> UI success if persistence succeeded
```

The automation call is deliberately downstream of persistence. A network failure in n8n cannot undo a Firestore write and must not cause the visitor to resubmit the same lead unnecessarily.

## Frontend modules
- `src/integrations/leadContract.ts`: pure request normalization, validation, payload construction, deterministic scoring primitives, and automation types.
- `src/integrations/leadAutomation.ts`: bounded best-effort webhook notification; receives the URL as an argument so business logic remains independently testable.
- `src/integrations/demoRequests.ts`: Firestore persistence followed by best-effort notification.
- `src/components/Contact.tsx`: existing UI; consumes the submit result without changing the success contract.

## n8n workflow
`workflows/n8n/lch-website-lead-intake.json`:
1. Webhook POST at stable path `lch/demo-request`.
2. Validate/normalize payload and reject malformed contract data.
3. Deterministically calculate score and reasons.
4. Classify `HOT`, `WARM`, or `LOW`.
5. Route to priority branches with placeholder/no-secret downstream actions.
6. Respond with JSON containing `ok`, `leadId`, `priority`, `score`, and `reasons`.

No external CRM/email/calendar credential is exported in this node. Those integrations can be attached downstream after credentials are configured.

## Firestore rule model
Only create is public. The document must contain the exact expected keys, consent must be true, strings are bounded, source/status are fixed, and `createdAt` must be the server request time. Public read/update/delete remain false.

## Configuration
`.env.example` gains `VITE_N8N_WEBHOOK_URL=`. Empty means automation is disabled/skipped while persistence remains functional.

## Failure semantics
- validation failure before persistence: submission fails;
- Firestore failure: submission fails;
- n8n URL absent: persistence succeeds, automation=`skipped`;
- n8n timeout/network/non-2xx: persistence succeeds, automation=`failed`;
- n8n 2xx: persistence succeeds, automation=`sent`.

## Production boundary
A localhost webhook or temporary tunnel is test infrastructure only. Stable HTTPS exposure, abuse controls, and production availability are GH-20 gates.
