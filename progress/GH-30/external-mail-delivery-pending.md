# GH-30 — external mail delivery blocked

App registration with per-user delegated Mail.Send was verified by Azure CLI but Outlook OAuth2 is not connected to n8n; the app currently has no active client secret. The Google service identity has a conditioned IAM grant but no n8n credential. Mac import is gated by a duplicate-safe dry-run. Four real recipients have not confirmed receipt. Cloud Sandbox LCH and Cloudflare alternative stay disabled. See docs/lch-n8n-mac-cutover.md. Do not mark Graph release gate complete.
