# GH-20 — Independent status after live browser/Firestore verification

Repository checks from the prior GH-20 revision remain valid. New external checks resolve two of the three previous blockers:

- PASS: public AI Studio create contract synchronized and persisted.
- PASS: strict Firestore rules deployed and reloaded from the live named database.
- PASS: synthetic public form create accepted under the strict live rules.
- BLOCKED: private n8n Firestore processor cannot execute until a dedicated Google credential is created/assigned.

No public n8n ingress is active. The Quick Tunnel remains stopped.
