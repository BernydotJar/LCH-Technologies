#!/usr/bin/env bash
# Reuse the existing private n8n-lina container; never create a second workflow engine.
# Optional LCH_N8N_* overrides are only for isolated executable tests.
set -euo pipefail
RUNTIME=/workspace/_shared/lina-n8n-runtime
START_SCRIPT=${LCH_N8N_START_SCRIPT:-$RUNTIME/bin/start.sh}
HEALTH_URL=${LCH_N8N_HEALTH_URL:-http://127.0.0.1:5678/healthz}
INTERVAL_SECONDS=${LCH_N8N_INTERVAL_SECONDS:-45}
LOCK_FILE=${LCH_N8N_LOCK_FILE:-/tmp/lch-n8n-keepalive.lock}
ONCE=${LCH_N8N_ONCE:-0}

if [ ! -x "$START_SCRIPT" ]; then
  echo 'n8n keeper: existing runtime start script missing' >&2
  exit 64
fi
if ! [[ "$INTERVAL_SECONDS" =~ ^[0-9]+$ ]] || (( INTERVAL_SECONDS < 1 || INTERVAL_SECONDS > 600 )); then
  echo 'n8n keeper: invalid poll interval' >&2
  exit 64
fi

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo 'n8n keeper: another keeper holds the runtime lock' >&2
  exit 73
fi

check_health() { curl -fsS --max-time 4 "$HEALTH_URL" >/dev/null 2>&1 9>&-; }

while :; do
  if check_health; then
    # Do not restart a healthy container or modify Lina's active workflow.
    :
  else
    echo "$(date -u '+%FT%TZ') n8n keeper: health failed; requesting recovery of existing runtime"
    if timeout --signal=TERM --kill-after=5s 600s "$START_SCRIPT" >/dev/null 2>&1 9>&- && check_health; then
      echo "$(date -u '+%FT%TZ') n8n keeper: runtime recovered"
    else
      echo "$(date -u '+%FT%TZ') n8n keeper: recovery failed; retry on next poll" >&2
    fi
  fi
  if [ "$ONCE" = '1' ]; then break; fi
  sleep "$INTERVAL_SECONDS" 9>&-
done
