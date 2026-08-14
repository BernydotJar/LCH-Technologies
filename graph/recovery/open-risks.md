# Recovered Open Risks

## R1 — Public write abuse
**State:** OPEN — owned by GH-19/GH-20.

The current `demoRequests` rule permits anonymous create without field-level validation or abuse controls. Public reads remain denied.

Required before production release:
- strict allowed-field/type/size validation;
- consent must be true;
- server-side or edge abuse controls/rate limiting for the automation endpoint;
- no privileged credentials in browser code.

## R2 — Deployment-source drift
**State:** OPEN — owned by GH-20/GH-17.

The public AI Studio app is not automatically synchronized from GitHub. Release verification must compare the deployed behavior/assets against the canonical repository or replace the deployment path with a reproducible pipeline.

## R3 — Local n8n availability
**State:** OPEN — owned by GH-20.

The current n8n instance is local Docker on the user's Mac. It is suitable for development but cannot be considered a production dependency until it has a stable HTTPS transport and an explicit availability/recovery model.
