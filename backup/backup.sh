#!/usr/bin/env bash
# Full DB backup (including article data, which db/init does NOT contain) from the
# dockerised postgres. Output dir configurable via BACKUP_DIR (default ./backup/dumps).
set -euo pipefail
cd "$(dirname "$0")/.."

set -a; [ -f .env ] && . ./.env; set +a
BACKUP_DIR="${BACKUP_DIR:-./backup/dumps}"
mkdir -p "$BACKUP_DIR"

FILE="$BACKUP_DIR/$(date +%Y-%m-%d_%H%M%S).sql"
# --clean --if-exists so the dump can be restored over an existing DB.
docker compose exec -T postgres pg_dump --clean --if-exists -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-conversion}" > "$FILE"
echo "Záloha vytvořena: $FILE"

# Keep ~2 weeks of backups.
find "$BACKUP_DIR" -name '*.sql' -mtime +14 -type f -delete
