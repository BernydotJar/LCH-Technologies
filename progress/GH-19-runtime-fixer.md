# GH-19 Runtime Fixer Report

## Runtime finding
The first real n8n production-webhook probes returned HTTP 403 before workflow execution because the Webhook node had `ignoreBots: true`. n8n's Webhook implementation uses the same authorization error response when `isbot()` classifies a User-Agent as a bot, so curl/Python probes were rejected. This would also be fragile for a future server-to-server dispatcher.

## Repair
- Removed `ignoreBots` from the lead webhook.
- Set `authentication: "none"` explicitly at node level.
- Kept public authentication/rate limiting/HTTPS protection assigned to GH-20 rather than User-Agent heuristics.
- Added contract assertions for the explicit webhook configuration.

## Real-runtime result after repair
Against the user's live local n8n runtime, workflow `LCH Website — Lead Intake` was updated and published. Canonical payloads produced:
- HOT: HTTP 202, `ok=true`, priority `HOT`, score `10`.
- LOW: HTTP 202, `ok=true`, priority `LOW`, score `1`.
- INVALID: HTTP 400, `ok=false`, validation errors returned.
- n8n execution history confirmed 9 accumulated executions for the workflow at verification time.

No real lead/customer data was used; all runtime probes used synthetic test identities.
