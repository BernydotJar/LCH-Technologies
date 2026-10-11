# GH-29 verification

- Google Cloud IAM API was accessed with the **existing Firebase CLI user OAuth session** only in memory. No token/key values printed or committed.
- Created `lch-lead-mail-n8n@rag-municipalidades.iam.gserviceaccount.com`.
- Added and re-read a conditional `roles/datastore.user` direct project grant with `resource.name=="projects/rag-municipalidades/databases/ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7"`.
- Read-only `node scripts/lchGoogleIamAudit.cjs --live`: `iamReady=true`, `expectedProjectBindingOnly=true`, `conditionalBindingCount=1`, `prohibitedUnconditionalGrants=0`, `userManagedKeyCount=0`, `effectiveFirestoreAccessVerified=false`, `n8nCredentialVerified=false`, `mailDeliveryVerified=false`.
- Fixture audit tests cover exact grant, missing grant, unconditional project grant, wrong database and extra privilege.
- n8n SQLite: 0 credentials, LCH workflow inactive, Lina workflow active. LCH public `/health` and n8n `/healthz` PASS.
- Attempt to programmatically create/import a Google private key was **blocked by platform safety control before execution**. The final independent audit verified no key from this work exists. No bypass attempt, no secrets in GitHub, no email sent.
- `node --test tests/lchGoogleIamAudit.test.cjs`: **5/5 PASS** (expected condition, unconditional/admin grant forbidden, wrong database and redundant grants).
- `npm run test`: **91/91 PASS** (all existing LCH/Donna/backend tests).
- `npm run typecheck`: PASS.
- `npm run build:deploy`: PASS, Donna server bundled; no new production deployment required because website runtime code did not change.
- Google API live grant audit repeated after tests: expectedProjectBindingOnly=true, key_count=0, no unexpected direct project bindings; effective datastore API access by the principal unverified until authentication.
