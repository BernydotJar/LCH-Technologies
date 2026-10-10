# GH-28 | Quality and runtime evidence

- `node --experimental-strip-types --test tests/n8nContactMail.test.ts`: **14/14 PASS**, exercising both new provider-failure guards and new exhausted-retry dead-letter branch.
- `python3 -m unittest tests/test_lch_n8n_release_preflight.py -v`: **4/4 PASS** on fixture-only in-memory SQLite credential metadata; never reads secret fields.
- LCH full `npm run test`: **91/91 PASS**.
- `npm run typecheck`: PASS.
- Guarded `npm run build:deploy`: PASS; Donna API built in `dist/server.mjs`, existing Rollup chunk-size warning only. No web source changes or public deployment required.
- Node `n8n-nodes-base` 2.39.6 native code read on installed container: `Microsoft Outlook` send operation returns `{success:true}` only after `POST /sendMail`; optional fields accept From, Reply-To, HTML body, custom x-lch-lead-id and one comma-separated four-recipient To. Native Firestore `query` operation supports `simple=false` and returns raw `document.name` / `updateTime`.
- Cloud Sandbox n8n 2.39.6 restored and guarded by `lch-n8n-keeper`. Pre-reimport SQLite backup stored privately at `/workspace/.tmp/n8n-gh28-before-import.sqlite` with restrictive mode. GH-28 workflow imported **INACTIVE** with real n8n CLI (`Successfully imported 1 workflow`); 13 stored nodes and exact source-vs-runtime node/connection JSON match. Original Lina row SHA256 stayed `02fc82857abf6a03d5482551267fe8ef1048ddaec6083a192357f37182d4b294`.
- Chrome macOS Computer Use session approved once, used to navigate to n8n Mac `Credentials` view, found empty `Create your first credential` and inspected a **blank** Outlook OAuth2 form. The form requires Client ID and Client Secret and shows callback `http://localhost:5678/rest/oauth2-credential/callback`. No credentials entered or saved; the delegated Computer Use session was revoked at inspection completion.
- Separate n8n instance discrimination: `127.0.0.1:5678/rest/settings` on Cloud Sandbox and `host.docker.internal:5678/rest/settings` have different (non-secret) settings fingerprints and owner setup states. Browser screenshots corroborate the Mac shows only one Lina workflow versus Cloud Sandbox two workflows.
- Public LCH `/health` still exposes Donna `grounded-v1` and the current immutable release; no changes to website, Firebase Spark or Firestore security rules.

## Production release caveat
No Google n8n Firestore credential or Microsoft Outlook OAuth2 credential exists in the verified Cloud Sandbox n8n. No Microsoft Entra app grant/redirect credential was created. Browser Mac n8n is separate and also has no saved credentials. No real Microsoft email was sent or received. The production gate must remain pending.

## Final recorded runtime preflight

`python3 scripts/lch_n8n_release_preflight.py` (actual sandbox n8n SQLite, read-only) returned exactly:

```json
{"blockers":["activation_time_not_configured","google_firestore_credential_not_bound","outlook_credential_not_bound","workflow_not_active"],"live_receipts_verified":false,"ready":false,"workflow_active":false}
```

The runtime source matches all 13 expected nodes and 11 connection entries; revision mismatch is no longer a blocker. `n8n-lina` `/healthz` HTTP 200, `lch-n8n-keeper` RUNNING, `lch-site` RUNNING. The public web `/health` still exposes immutable release `19d81f9f48b957f68b8cbdebedae9de8c24c222c`. No test contact was sent, no Microsoft emails were issued and no Google/Entra secrets were created.
