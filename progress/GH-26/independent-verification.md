# GH-26 | Independent verification of boundaries

The verifier inspected **two different systems**: the committed workflow source under `workflows/n8n`, and the actual preexisting n8n SQLite runtime state. Results were not inferred solely from generated code:

1. **n8n integrity:** a consistent DB backup, runtime `/healthz`, CLI workflow import and a per-row hash comparison confirm that the original Lina automation was not modified or disabled. The LCH workflow is installed but inactive, with no stored credentials.
2. **Product and privacy:** source reads from the existing Spark Firestore named database, filters only consented `website` records created after activation, prevents unapproved recipients and HTML insertion, and does not alter browser consent or public n8n routes.
3. **Data race and transport:** Node vm execution of actual Code-node JavaScript passes deterministic source tests. REST conditional PATCH URLs are fully qualified after an identified correction and include `currentDocument.updateTime`; acknowledgment requires the worker's original lease ID. Outlook node requires a delegated OAuth credential and sends one message to the four specified recipients when authorized. No live external request has been made.

The n8n container lifecycle is tied to an isolated Cloud Sandbox workstation; an explicit restart test and monitor are required before production activation. Idempotent CAS mitigates but does not completely eliminate duplicates if the mail provider accepts an email before the acknowledgement can be recorded.

**Independent quality verification: PASS. Public recipient-delivery verification: NOT EXECUTED.**
