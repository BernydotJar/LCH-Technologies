# GH-20 Design — Private Firestore Queue

## Production topology

```text
LCH public website
      |
      | Firestore create
      v
demoRequests/{leadId}
  status: new
  automationStatus: pending
      |
      | private scheduled query
      v
n8n on Eduardo's Mac
  LCH Website — Firestore Lead Processor
      |
      +--> deterministic scoring
      +--> routing metadata / future CRM, Gmail, Calendar
      +--> update only automation* fields
```

There is no Internet route to n8n in the production lead path. This removes Cloudflare ingress, CORS, webhook authentication, and editor-exposure concerns from the core workflow.

## Firestore contract
The browser may create only the exact initial schema. `automationStatus` is fixed to `pending` at create time. Public read/update/delete remain denied. The n8n Google credential operates server-side and is never embedded in Vite or committed.

The processor queries:
- collection: `demoRequests`
- filter: `automationStatus == pending`
- bounded batch: 25

After scoring, it updates only:
- `automationStatus = processed`
- `automationPriority`
- `automationScore`
- `automationReasons`
- `automationQueue`
- `automationSlaMinutes`
- `automationProcessedAt`

Using Firestore `batchWrite` update masks preserves the original lead fields.

## Recovery semantics
If n8n is off, documents stay `pending`. The next scheduled run can process them. This is strictly more durable than browser -> local webhook delivery and requires no public availability of the Mac.

## Development webhook
`LCH Website — Lead Intake` remains a tested development/controlled-integration workflow. `VITE_N8N_WEBHOOK_URL` is optional; production should leave it unset when private polling is active.

## Cloudflare status
The Quick Tunnel proved external browser/CORS transport but exposed the n8n web application root. The LCH domain currently does not resolve, so no production Named Tunnel hostname is available. Cloudflare is therefore removed from the critical production lead path rather than weakening isolation.
