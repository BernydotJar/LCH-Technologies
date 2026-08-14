# GH-19 Critic / Red Team Review

## Findings

### F1 — Scoring implementation drift risk — FAIL
The repository contains a deterministic scorer in `leadContract.ts` and a separately embedded copy in the n8n Code node. Static tests verify each artifact exists but do not prove both implementations classify the same payloads. A future edit can silently make website tests and n8n behavior diverge.

**Required repair:** execute the embedded n8n Code node in a test harness against representative HOT/WARM/LOW/INVALID envelopes and compare its output to the canonical TypeScript contract/scorer.

### F2 — Client time is propagated as if it were workflow metadata — FAIL
The n8n Code node forwards `submittedAt` supplied by the browser. This value is not authoritative and should not be used by future SLA or audit logic.

**Required repair:** preserve it only as `clientSubmittedAt` if useful and add a workflow-generated `receivedAt` timestamp.

### F3 — n8n runtime import/execution not yet verified — BLOCKED
The workflow has not yet been imported and executed on the user's current n8n instance. The instance is healthy, but the remote-debug browser profile is not authenticated. The sandbox's nested Docker daemon also failed to register the current n8n image layer, so that fallback could not provide runtime evidence.

**Required before GH-19 release gate PASS:** authenticated import and representative webhook execution on a real n8n runtime.

### F4 — Public transport/CORS/rate limiting — DEFERRED, correctly owned by GH-20
The browser-to-n8n cross-origin path, stable HTTPS URL, CORS origin restriction, rate limiting, and production availability are not proven. This is explicitly a GH-20 responsibility and must remain release-blocking downstream.

### F5 — Firestore rules are canonical but not deployed — DEFERRED, correctly owned by GH-20
The hardened rules file improves the repository contract, but production rules deployment has not been executed or verified. Do not claim the live project is hardened until GH-20 evidence proves deployment.

### F6 — Deferred Firestore bundle size — PASS with observation
Vite reports the dynamically loaded submission chunk at ~501 kB. The initial application bundle remains ~383 kB and the chunk is loaded only on form submission. This is not a GH-19 release blocker.

## Verdict
REPAIR REQUIRED for F1 and F2. Runtime gate remains BLOCKED on F3 after those repairs.
