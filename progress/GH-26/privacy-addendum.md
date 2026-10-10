# GH-26 — Privacy hardening addendum after initial quality gate

An additional n8n-specific review identified that retaining full successful/error/manual execution data would persist prospect names, addresses and project descriptions inside n8n's SQLite database after processing. This is unnecessary: Firestore is already the durable system of record and contains an independent machine-state `notification` field.

The GH-26 workflow source now sets `saveDataSuccessExecution=none`, `saveDataErrorExecution=none`, `saveManualExecutions=false` and `saveExecutionProgress=false` to minimize execution-data retention. No data is removed from Firestore and Microsoft remains the recipient of an email only after human-consented lead submission and authorized Outlook send.

The amended focused test verifies all four workflow settings; 9/9 tests pass. The workflow remains inactive with 0 n8n credentials and no mail sent. This addendum is append-only; original reviewer evidence hashes are preserved.
