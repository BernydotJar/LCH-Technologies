# GH-29 independent verification boundary

The new principal's *direct project policy* is exactly one conditional `roles/datastore.user` binding for the named Firestore database, per live Google IAM API and five fixture checks. The prior LCH service identity/key was not changed. No Google private key exists for the new principal; 0 credentials in the actual sandbox n8n means Firestore has not been queried from this new SA. The Outlook OAuth2 application has also not been created and the four recipients have no live test receipts. These absences are explicit release blockers.

Quality can pass independently; the external deliverability gate cannot be marked PASS without fresh Firestore/Outlook identity proofs and inbox receipt evidence.
