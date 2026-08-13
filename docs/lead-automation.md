# LCH Lead Automation

## Purpose

The website treats Firestore as the durable lead record and n8n as the follow-up orchestrator. The visitor receives a successful submission only after the lead is persisted. Automation delivery happens afterwards and is best-effort.

## Data flow

```text
Website form
  -> validate and normalize
  -> Firestore demoRequests (durable)
  -> obtain leadId
  -> optional n8n webhook notification
  -> deterministic scoring and priority route
```

A failure or timeout in n8n does not erase the Firestore lead and does not ask the visitor to submit the same lead again.

## Configuration

The frontend supports:

```text
VITE_N8N_WEBHOOK_URL=
```

When empty, lead persistence still works and automation reports `skipped`. For local development the helper accepts localhost-style HTTP endpoints. Non-local automation endpoints must use HTTPS.

Do not put credentials or private API tokens in this variable. A webhook URL is an invocation endpoint, not a secret-storage mechanism.

## n8n workflow

Import:

`workflows/n8n/lch-website-lead-intake.json`

Workflow name:

`LCH Website — Lead Intake`

Webhook path:

`lch/demo-request`

The workflow is exported inactive so importing it cannot create an unexpected public endpoint. After test execution and transport review, publishing/activation is a separate release action.

The workflow validates the `lch.lead.v1` envelope, scores leads deterministically, and routes them into:

- `HOT` -> `sales_immediate`, target SLA 15 minutes;
- `WARM` -> `sales_standard`, target SLA 240 minutes;
- `LOW` -> `sales_nurture`, target SLA 1440 minutes.

`leadId` is the stable idempotency key downstream systems should use to avoid duplicate CRM records or repeated actions.

## Firestore rules

The canonical `firestore.rules` allows public create only for the exact demo-request schema with bounded strings, allowed interest values, consent=true, fixed source/status, and a server timestamp. Public read/update/delete remain denied.

Deploying these rules is a production infrastructure action and is not implied by committing the rules file.

## Production boundary

A localhost n8n instance is appropriate for development but not a production dependency. GH-20 owns stable HTTPS transport, rate limiting/abuse controls, production-origin validation, and availability/recovery validation. Candidate transports include a Cloudflare Named Tunnel or a managed Firebase endpoint.

## Downstream extensions

Gmail, Calendar, CRM, proposal generation, or AI enrichment should attach after the deterministic intake/scoring layer. They must use credentials stored in n8n or another server-side secret store; no such credentials are exported with the workflow.
