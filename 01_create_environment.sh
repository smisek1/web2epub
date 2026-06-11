#!/usr/bin/env bash
# Single entry point: builds and starts the whole stack with one command.
# Replaces the old hand-rolled docker run script. Brings up every service whose
# build context already exists, so it works at each milestone and grows into the
# full stack (postgres + worker + api + frontend) as those parts are added.
set -euo pipefail
cd "$(dirname "$0")"

# First run convenience: create .env from the template (edit the password after).
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Vytvořen .env z .env.example — uprav heslo v .env."
fi

# Only start services that are buildable right now.
services="postgres python-worker"
[ -f server/Dockerfile ] && services="$services node-api"
[ -f web-ui/Dockerfile ] && services="$services frontend"

echo "Spouštím služby: $services"
docker compose up --build -d $services

# Wait for postgres to report healthy before declaring success.
echo -n "Čekám na healthy postgres"
for _ in $(seq 1 30); do
  status="$(docker compose ps --format '{{.Health}}' postgres 2>/dev/null || true)"
  if [ "$status" = "healthy" ]; then
    echo " — OK"
    break
  fi
  echo -n "."
  sleep 2
done

echo
docker compose ps
echo
echo "Hotovo. API: http://localhost:${API_PORT:-3000}  |  UI: http://localhost:${FRONTEND_PORT:-8080}"
