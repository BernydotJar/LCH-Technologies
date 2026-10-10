# GH-27 | Existing n8n availability monitor for LCH Spark leads

Reuse the `n8n-lina` runtime in Cloud Sandbox. Do not create a separate container, alter Lina's workflows or relax Firebase Spark. A dedicated Supervisor program under the existing LCH supervisor runs a lightweight health keeper, detects n8n local `/healthz` failures and invokes only the existing `lina-n8n-runtime/bin/start.sh`. Supervisor keeps the keeper itself alive. The keeper never starts an alternative email sender.

Source: `scripts/lch-n8n-keepalive.sh`. Deployment copy: `/workspace/.deployment-tools/lch-n8n-keepalive.sh` with SHA match. Runtime Supervisor: `/workspace/.deployment-tools/lch-site-supervisord.conf` program `[program:lch-n8n-keeper]`. Backup: `.pre-gh27-n8n-monitor`. Only the new program is added with `supervisorctl reread && supervisorctl update`. LCH website's process must not restart.

The existing workstation autostart script already restores the LCH supervisor when explicitly invoked, which would include this additional program. A **complete workstation recreation has not been exercised**. This provides in-container process-level recovery, not high availability or a confirmed reboot/host persistence guarantee.

Do not enable the LCH mail workflow until Microsoft Outlook and Firestore credentials, a real sender authorization check, an authenticated n8n editor/owner and a four-inbox mail receipt have passed. Protect visitor data and do not log secrets. Firebase stays on Spark.

The supervisor program configuration is tracked in `infra/lch-n8n-keeper.supervisor.conf` for reinstallability; runtime watcher child processes must explicitly close the advisory lock descriptor (`9>&-`) so a crash never stalls recovery in BACKOFF.
