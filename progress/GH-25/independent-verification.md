# GH-25 — independent verifier

Verified across three independent boundaries:

1. **Visitor and product authority:** no changed website code or automatic client sends, only leads already saved in the existing named Firestore database with explicit consent and source `website`; fixed exact approved recipient list cannot be extended from a prospect message.
2. **Wire integrations:** real WebCrypto RS256 signature verifies in Node with generated asymmetric keys; Firestore REST adapter checks project/database/query/CAS semantics; Graph integration verifies one message containing four recipients and a Reply-To; a full simulated HTTP transport verifies a second Cron produces zero duplicate mail.
3. **Operational Free tier:** Wrangler dry-run works without Cloudflare account privileges, scheduled workerd dev endpoint runs, browser surface returns 404 and missing secrets fail closed. Limits were audited against Cloudflare Workers Free CPU and subrequest documentation; the scan/attempt window is bounded and risk disclosed.

No production Cloudflare deployment, real Microsoft Graph send or four-buzon receipt can be claimed. This review does not imply an actual IBM Granite inference was run; adversarial review is based on source and independent executable tests.

**Verifier recommendation:** PASS for scoped quality, production gate pending.
