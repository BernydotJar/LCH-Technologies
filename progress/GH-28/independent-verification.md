# GH-28 | Independent verifier

The verifier checked three independent boundaries:

1. **Source vs native n8n runtime**: exported workflow is inactive, 13-node layout with two post-provider guards and retry-exhaustion branch. Native Microsoft Outlook node returns `success:true` after a provider call; simulated data with 403/error/false/no-success never advances to Firestore accepted ACK. Firestore CAS conflicts and mismatched lease IDs never proceed to Outlook. The dead-letter branch uses `updateMask.fieldPaths=notification` and `currentDocument.updateTime`, never sends mail.
2. **Private runtime identity and preservation**: the Mac browser session and Cloud Sandbox `n8n-lina` have different n8n instance configs. The Cloud Sandbox workflow can be reimported inactive after DB backup without touching Lina's active workflow. The Mac browser credentials screen is empty. No secrets were read/pasted.
3. **Product/regression contract**: strict consent and source, Spark free-tier constraints, fixed four destination addresses, controlled Reply-To, existing public LCH health and full TypeScript/build regressions remain intact.

Expected outcome: quality gate PASS; release gate NOT EVALUATED because two OAuth service identities and actual recipient receipts are unavailable. This report is evidence-backed without claiming unexecuted network sends or IBM Granite inference.
