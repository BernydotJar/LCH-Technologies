# Recovered Architecture

Source: Google AI Studio app `8963e7a3-87ce-4ca9-938c-9490f698d4c7` plus repository inspection.

## Runtime architecture
- Frontend: React + Vite + TypeScript.
- Styling: Tailwind CSS v4.
- Motion: `motion/react`.
- Icons: Lucide React.
- Lead persistence: Cloud Firestore collection `demoRequests`.
- Current public preview: Google AI Studio hosted `ais-pre` URL.

## Canonical source of truth
`BernydotJar/LCH-Technologies` is the canonical engineering source from this recovery forward. The Google AI Studio app is currently a separately managed deployment mirror. A GitHub commit does **not** automatically update the `ais-pre` app; synchronization/deployment must be verified explicitly at a release gate.

## Current security state
Observed Firestore rules for `demoRequests`:
- anonymous `create` is currently allowed;
- public `read`, `update`, and `delete` are denied;
- all other document reads/writes are denied.

This protects lead confidentiality but does not sufficiently validate or rate-limit public writes. The legacy GH-12 DONE state is preserved only as recovered history and must not be interpreted as current production security approval. Active work GH-19/GH-20 must address schema validation, abuse controls, and protected automation transport before final release.

## Automation direction
Firestore remains the durable lead record. n8n is the orchestration layer for follow-up. Automation failure must not cause loss of a successfully persisted lead.
