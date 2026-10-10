# GH-25 | Independent verifier

The verifier exercised three independent boundaries without credentials:

1. **Contract:** exactly four approved recipients, one Graph message, controlled Reply-To, no unauthorized destination or HTML injection, user consent enforced.
2. **Provider:** a mocked OAuth2 client-credentials exchange reaches Graph `/users/contacto@lch-technologies.com/sendMail`, recognizes only HTTP 202 as acceptance and treats permanent vs transient failures distinctly.
3. **Persistence:** an in-memory Firestore transaction model verifies only one send on repeated lead events, no effect on `automationStatus`, idempotent skip when already accepted, bounded retry/blocked states, and a leased event causing retry rather than concurrent send.

**PASS for code/contract QA.** Real Microsoft sending and recipient delivery were deliberately not exercised in the absence of Entra app authorization. Google Cloud billing blocked the functions deploy dry-run at Secret Manager, so no production gate can be approved.
