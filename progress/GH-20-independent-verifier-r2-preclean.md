# GH-20 — Independent verifier, revision 2 pre-cleanup

Result: BLOCKED only on local secret-material cleanup.

Independent observations:
- Repository suite previously passed 20/20 tests, typecheck, production build, audit and secret scan on revision 2.
- Authenticated n8n UI reports the Google Service Account credential connection test successful.
- Query node independently read the intended named Firestore database and found the retained pending synthetic lead.
- The processor scorer produced the expected HOT / score 10 deterministic result.
- Firestore upsert returned a new update timestamp and processed automation metadata.
- A fresh query for `automationStatus == pending` returned no output after processing.
- n8n reports the private workflow as Published with the one-minute Schedule Trigger enabled.
- Google Cloud service-account key inventory was reduced from three active keys to one active key, leaving only the key used by n8n.

The verifier does not issue PASS until the downloaded JSON copy is deleted and clipboard residue is cleared locally.
