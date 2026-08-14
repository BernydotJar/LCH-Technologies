# GH-19 Independent Verifier — Revision 2

Result: PASS.

Independent live-runtime validation was performed against the user's actual local n8n instance, not a mock.

Workflow:
- Name: `LCH Website — Lead Intake`
- Runtime workflow ID: `TxbBDZQkHMOEl1p5`
- Updated from the canonical repository JSON and published successfully.

Synthetic runtime probes only (no real lead/customer data):
- HOT -> HTTP 202, `ok=true`, priority `HOT`, score `10`.
- LOW -> HTTP 202, `ok=true`, priority `LOW`, score `1`.
- INVALID -> HTTP 400, `ok=false`, structured validation errors.
- Execution API returned HTTP 200 and 9 accumulated executions for this workflow at verification time.

The first runtime probe discovered `ignoreBots=true` blocked automated/server-to-server callers. The canonical workflow was repaired, republished, and the full runtime matrix then passed.

Remaining public HTTPS/auth/rate-limit/CORS exposure is intentionally not claimed here and remains release-blocking GH-20 work.
