#!/usr/bin/env bash
# Restore the DB from a backup .sql file (defaults to the newest in BACKUP_DIR).
# Usage: ./backup/restore.sh [path/to/dump.sql]
set -euo pipefail
cd "$(dirname "$0")/.."

set -a; [ -f .env ] && . ./.env; set +a
BACKUP_DIR="${BACKUP_DIR:-./backup/dumps}"
FILE="${1:-$(ls -1t "$BACKUP_DIR"/*.sql 2>/dev/null | head -n1 || true)}"

if [ -z "${FILE:-}" ] || [ ! -f "$FILE" ]; then
  echo "Žádná záloha k obnově (BACKUP_DIR=$BACKUP_DIR)." >&2
  exit 1
fi

echo "Obnovuji z: $FILE"
docker compose exec -T postgres psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-conversion}" < "$FILE"
echo "Hotovo."
