# GH-20 — Live Firestore + AI Studio validation

Result: PASS for the browser-to-Firestore production path.

Verified through the authenticated user browser using Chrome DevTools Protocol; no browser cookies, OAuth tokens, Firebase client configuration values, or secrets were persisted in this repository.

- AI Studio `src/components/Contact.tsx` was updated to persist `automationStatus: 'pending'` with each accepted `demoRequests` create.
- AI Studio `firestore.rules` was synchronized to the canonical strict ruleset from this branch.
- Both AI Studio file changes survived a full editor reload, proving backend persistence rather than a transient Monaco edit.
- The public `ais-pre` bundle was reloaded and independently confirmed to contain the `automationStatus` contract.
- Firebase Console was opened on the named Firestore database used by the LCH AI Studio app. The live rules initially contained `allow create: if true;`.
- The canonical strict ruleset was published to that named database. A full Firebase Console reload showed the strict ruleset active, no `allow create: if true`, and no unpublished changes.
- A synthetic public-form submission (`GH20 Synthetic`, non-personal test data) was accepted by the live site after the rules deployment and displayed `Solicitud recibida`. This proves the current public bundle and live rules agree on the write contract.
- The first browser automation attempt failed because the test harness set the checkbox DOM property without generating React's click-driven state transition. Repeating with a real checkbox click passed; this was a harness artifact, not a product defect.

Outstanding production blocker:

- n8n has no Google/Firestore credential yet. Existing project service accounts are either broad defaults or belong to another workload and will not be reused. A dedicated least-privilege identity is required before the private Firestore processor can execute.

A synthetic pending lead is intentionally retained until the private processor is validated; it should be cleaned up after the end-to-end processor gate.
