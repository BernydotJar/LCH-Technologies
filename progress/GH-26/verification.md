# GH-26 | Verification record

## Source tests
- `node --experimental-strip-types --test tests/n8nContactMail.test.ts`: **9/9 PASS**.
- Full LCH `npm run test`: **81/81 PASS**.
- `npm run typecheck`: PASS.
- Guarded `npm run build:deploy` with existing local ignored Firebase config: PASS (no changes to LCH runtime code, output includes dist/server.mjs).
- `git diff --check`: PASS.
- New n8n contract tests load the actual JSON, inspect unique 9 nodes, 5-minute scheduler, Firestore named database and server-timestamp query, fail-closed activation, verified 4-recipient sender contract, PII/HTML escaping, reject invalid/old/unconsented/leased leads, CAS URL vendor prefix and conditional update mask, and verify original lease before recording accepted.

## Runtime validation
- Existing n8n v2.39.6 `n8n-lina` restored via its shared persisted data and its existing service script. `GET http://127.0.0.1:5678/healthz` returns HTTP 200 `{"status":"ok"}`.
- Before importing: a consistent private n8n SQLite backup was taken to `/workspace/.tmp/n8n-gh26-before-import.sqlite` with restrictive permission.
- `n8n import:workflow` with the existing personal project accepted the **one** GH-26 JSON workflow and reported `Successfully imported 1 workflow`.
- Reimport after REST HTTPS fix also succeeded.
- Live n8n database: two workflows only; Lina's original active flag remains `1`, new LCH workflow active flag `0`.
- A SHA-256 over Lina's name, nodes, connections, settings and active fields matched **exactly before and after** LCH import.
- Credential inventory: `0` before and after; no credential secrets were imported or exposed.
- Existing n8n editor is local-only; ingress/tunnel disabled, first-time owner setup not completed. No automatic mail sending.

## Provider limitations
No live Google credential, Microsoft Outlook OAuth2 credential, end-to-end email send, mailbox delivery trace or reliable n8n service autostart is verified. Cloudflare's earlier Wrangler device login expired without approval. GH-25 external Worker remains undeployed.

**The quality gate may be PASS; the live delivery gate must remain PENDING.**
