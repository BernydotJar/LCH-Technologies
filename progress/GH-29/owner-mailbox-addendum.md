# GH-29 — Mailbox ownership clarification

Owner explicitly confirmed `contacto@lch-technologies.com` has its **own Microsoft 365 license and mailbox** and authorized setup of Microsoft 365, Google and n8n.

The least-privilege implementation is **delegated `Mail.Send` while logging in as the contacto mailbox itself**. Do not request Exchange `Send As`, `Mail.Send.Shared` or broad tenant-wide application `Mail.Send`. The LCH n8n Outlook OAuth2 credential still requires an Entra app client ID/secret and the callback URL of the **selected Cloud Sandbox n8n**, which is separate from the logged-in Mac instance.

The role of Google is Firestore only: Google Cloud stores consented lead records and n8n must query/update notification state; Microsoft 365 sends the mail. No Google Workspace or Gmail, and no Firebase Blaze, are required.

This addendum updates the earlier generic delegated-sender discussion without changing prior signed review evidence. No OAuth credentials were created or emails delivered in this step.
