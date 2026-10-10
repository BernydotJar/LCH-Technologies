# GH-27 | Local n8n recovery test evidence

- Existing `n8n-lina` 2.39.6 container: healthy before and after. Original Lina workflow unaffected by the keeper.
- `scripts/lch-n8n-keepalive.sh`: five isolated tests cover healthy no-op, synthetic recovery by a mock existing runtime start script, invalid poll interval, missing start script and a crashed parent whose sleep child must not retain the lock. Production keeper checked in one-shot healthy mode (no restart).
- Full LCH `npm run test`: **86/86 PASS** with dependencies present; TypeScript check PASS.
- Saved supervisor config backup `/workspace/.deployment-tools/lch-site-supervisord.conf.pre-gh27-n8n-monitor`, deployed the keeper as a separate named supervisor program.
- `supervisorctl reread` recognized `lch-n8n-keeper: available`, `supervisorctl update` added it without restarting `lch-site`.
- Supervisor shows both `lch-n8n-keeper RUNNING` and `lch-site RUNNING`. Deliberate restart of **only keeper** succeeded while keeping the LCH site PID unchanged (`51379` in this execution) and n8n healthy.
- `https://lch-app.cloud/health` continued returning the current release `19d81f9f48b957f68b8cbdebedae9de8c24c222c`, product `lch-site`, donna `grounded-v1`.
- Outage/recovery of live n8n and full workstation recreation were **not** intentionally exercised, to avoid disrupting Lina's current workflow and site service.

**Verdict:** local keeper implementation and non-disruptive deployment PASS. Durable host-restart test and credentials/real email delivery remain pending.

- An adversarial live `SIGTERM` to the **keeper only** first exposed an inherited `flock` FD in a sleep child, delaying restart. No n8n or LCH service failed. Corrected script to close FD 9 on curl, timeout/start and sleep children.
- New regression explicitly kills its own fixture keeper and verifies the lock is immediately claimable despite an orphaned sleep child. Five keeper tests PASS.
- After restarting the keeper with the corrected script, an unexpected `SIGTERM` to the keeper caused Supervisor to spawn a new PID automatically (58382 -> 58390) within six seconds. The website PID remained 51379 and n8n health remained HTTP 200.
- Runtime Supervisor stanza matches tracked template `infra/lch-n8n-keeper.supervisor.conf`; no extra containers.
