#!/usr/bin/env bash
# GH-30: prepare exactly one Mac n8n executor; import LCH INACTIVE; never alter Lina.
set -euo pipefail
umask 077
MODE=dry-run
CONTAINER=${LCH_N8N_MAC_CONTAINER:-cloud-sandbox-n8n-lina}
GUARD=${LCH_N8N_GUARD:-$(cd "$(dirname "$0")" && pwd)/lch_n8n_workflow_guard.py}
SOURCE_URL='https://raw.githubusercontent.com/BernydotJar/LCH-Technologies/97f027b248440b89ac715d8e9b77109a47045821/workflows/n8n/lch-contact-mail-spark.workflow.json'
SOURCE_SHA256='c419f62402ad6758d9cbef605b3c981f404a66e110d23d488bcca080bf7da1f0'
SOURCE_FILE=''
BACKUP_DIR=${LCH_N8N_BACKUP_DIR:-$HOME/.cloud-sandbox-mcp-data/backups/lch-n8n}

usage() {
  echo 'Usage: bash lch-n8n-mac-bootstrap.sh [--dry-run | --apply] [--source PATH]'
  echo '  --dry-run checks Mac container, source workflow and duplicates; no import'
  echo '  --apply creates a SQLite hot backup and imports LCH inactive, verifying Lina unchanged'
}
while [ "$#" -gt 0 ]; do
  case "$1" in
    --apply) MODE=apply ;;
    --dry-run) MODE=dry-run ;;
    --source) shift; [ "$#" -gt 0 ] || { usage; exit 2; }; SOURCE_FILE=$1 ;;
    --help|-h) usage; exit 0 ;;
    *) usage; exit 2 ;;
  esac
  shift
done
for cmd in docker python3 curl shasum mktemp; do
  command -v "$cmd" >/dev/null || { echo "BLOCKED: missing $cmd" >&2; exit 2; }
done
[ -r "$GUARD" ] || { echo 'BLOCKED: workflow guard script unavailable' >&2; exit 2; }
[ "$CONTAINER" = cloud-sandbox-n8n-lina ] || { echo 'BLOCKED: unexpected Mac n8n container name' >&2; exit 2; }
[ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER")" = true ] || { echo 'BLOCKED: Mac n8n not running' >&2; exit 2; }
RESTART=$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' "$CONTAINER")
case "$RESTART" in unless-stopped|always) : ;; *) echo 'BLOCKED: Mac n8n lacks restart policy' >&2; exit 2 ;; esac
curl --silent --show-error --fail --max-time 5 http://localhost:5678/healthz >/dev/null || { echo 'BLOCKED: Mac n8n health unavailable' >&2; exit 2; }
N8N_VERSION=$(docker exec "$CONTAINER" n8n --version 2>/dev/null | tail -n 1)
python3 - "$N8N_VERSION" <<'PYVERSION'
import sys
try:
    parts=[int(p) for p in sys.argv[1].strip().split('.')[:3]]
except ValueError:
    raise SystemExit('BLOCKED: unknown n8n version')
if len(parts)!=3 or parts < [2, 39, 6]:
    raise SystemExit('BLOCKED: unsupported n8n version')
PYVERSION
WORK=$(mktemp -d "${TMPDIR:-/tmp}/lch-n8n-bootstrap.XXXXXXXX")
chmod 700 "$WORK"
RUN_ID="lch-boot-$$"
cleanup() {
  docker exec "$CONTAINER" rm -f "/tmp/$RUN_ID-before.json" "/tmp/$RUN_ID-after.json" "/tmp/$RUN_ID-input.json" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT INT TERM
if [ -n "$SOURCE_FILE" ]; then
  cp "$SOURCE_FILE" "$WORK/workflow.json"
else
  curl --fail --silent --show-error --location --max-time 25 "$SOURCE_URL" -o "$WORK/workflow.json"
fi
ACTUAL_SHA256=$(shasum -a 256 "$WORK/workflow.json" | awk '{print $1}')
[ "$ACTUAL_SHA256" = "$SOURCE_SHA256" ] || { echo 'BLOCKED: pinned workflow source checksum mismatch' >&2; exit 2; }
python3 "$GUARD" source "$WORK/workflow.json"
docker exec "$CONTAINER" n8n export:workflow --all --output="/tmp/$RUN_ID-before.json" >/dev/null
docker cp "$CONTAINER:/tmp/$RUN_ID-before.json" "$WORK/before.json" >/dev/null 2>&1
python3 "$GUARD" before "$WORK/before.json"
echo "n8n_host=mac container=$CONTAINER restart=$RESTART mode=$MODE"
if [ "$MODE" = dry-run ]; then
  echo 'READY_FOR_INACTIVE_IMPORT: no workflow database changes'
  exit 0
fi
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
DB_PATH=''
while IFS='|' read -r origin destination; do
  [ -d "$origin" ] || continue
  case "$destination" in /home|/home/node/.n8n|/home/node) : ;; *) continue ;; esac
  candidate=$(find "$origin" -maxdepth 4 -name database.sqlite -type f -print -quit 2>/dev/null || true)
  if [ -n "$candidate" ]; then DB_PATH=$candidate; break; fi
done < <(docker inspect -f '{{range .Mounts}}{{printf "%s|%s\n" .Source .Destination}}{{end}}' "$CONTAINER")
[ -n "$DB_PATH" ] || { echo 'BLOCKED: cannot find persistent SQLite database for backup' >&2; exit 2; }
BACKUP_DB="$BACKUP_DIR/n8n-lch-pre-import-$TIMESTAMP.sqlite"
python3 - "$DB_PATH" "$BACKUP_DB" <<'PY'
import pathlib,sqlite3,sys
src=sqlite3.connect('file:'+pathlib.Path(sys.argv[1]).resolve().as_posix()+'?mode=ro',uri=True)
dst=sqlite3.connect(sys.argv[2]);src.backup(dst);dst.close();src.close()
PY
chmod 600 "$BACKUP_DB"
PROJECT_ID=$(python3 - "$BACKUP_DB" <<'PY'
import sqlite3,sys
c=sqlite3.connect(sys.argv[1]);rows=c.execute("select distinct s.projectId from shared_workflow s join workflow_entity w on w.id=s.workflowId where lower(w.name) like '%lina%' and lower(w.name) like '%agenda%'").fetchall()
if len(rows)!=1:raise SystemExit('BLOCKED: unique existing Lina owner project not determined')
print(rows[0][0]);c.close()
PY
)
[ -n "$PROJECT_ID" ] || { echo 'BLOCKED: missing owner project' >&2; exit 2; }
docker cp "$WORK/workflow.json" "$CONTAINER:/tmp/$RUN_ID-input.json" >/dev/null 2>&1
docker exec "$CONTAINER" n8n import:workflow --input="/tmp/$RUN_ID-input.json" --projectId="$PROJECT_ID" --activeState=false >/dev/null
docker exec "$CONTAINER" n8n export:workflow --all --output="/tmp/$RUN_ID-after.json" >/dev/null
docker cp "$CONTAINER:/tmp/$RUN_ID-after.json" "$WORK/after.json" >/dev/null 2>&1
python3 "$GUARD" after "$WORK/before.json" "$WORK/after.json"
echo "IMPORT_VALIDATED: LCH inactive, Lina unchanged; private SQLite backup at $BACKUP_DB"
echo 'NEXT_GATE: Google Firestore and Outlook OAuth credentials, real four-inbox receipts; DO NOT activate yet'
