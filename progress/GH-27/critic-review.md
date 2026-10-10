# GH-27 | Adversarial review

1. **HIGH – full workstation recreation (unverified).** Supervisor monitoring is reliable only while the isolated workstation's LCH supervisord runs. A complete container removal or host reboot could stop both supervisors. The existing autostart entrypoint has a way to launch LCH supervisor, but no end-to-end reboot was performed. Production delivery cannot be claimed highly available.
2. **MEDIUM – side effects on Lina (mitigated).** Keeper probes local n8n health and calls the existing n8n restoration script only if unavailable; does not create a second n8n container or edit any workflow. Verified healthy case is a no-op and restart of keeper left Lina's n8n process healthy.
3. **MEDIUM – duplicated monitors (mitigated).** Advisory `flock` prevents more than one keeper active simultaneously. Supervisor auto-restarts a crashed keeper with bounded retry count.
4. **MEDIUM – observability/data leakage (mitigated).** Keeper logs timestamps and generic lifecycle markers, not prospect data, provider tokens or workflow output. Supervisor logs rotate (5 MB, two backups).
5. **MEDIUM – watchdog blind spots (known).** `/healthz` detects process availability, not a disabled/broken LCH workflow, expired OAuth2 grants or Firestore network failures. Add operational alerts and a qualified test lead when credentials are configured.
6. **HIGH – user requirement delivery remains unfulfilled (release blocker).** New LCH workflow is still inactive; the n8n installation had zero credentials. Activating without authenticated scoped Google/Outlook identities risks lead loss or unauthorized send. Do not claim email delivery.

**Quality PASS**, **production mail-delivery gate pending**. This reviewer did not run external IBM Granite inference.

7. **HIGH – inherited keeper advisory lock (found and fixed).** A deliberate SIGTERM to the keeper initially left its shell child `sleep` holding file descriptor 9; Supervisor entered transient BACKOFF. The fix closes the inherited descriptor for all spawned children; the fifth isolated test verifies the lock is released immediately after parent termination, and a second live SIGTERM demonstrated automatic restarts with n8n and LCH uninterrupted.
