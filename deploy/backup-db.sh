#!/usr/bin/env bash
# Sauvegarde PostgreSQL (pg_dump) à partir de DATABASE_URL dans .env de l'app.
# Usage (root ou cron) :
#   sudo bash deploy/backup-db.sh
# Variables optionnelles :
#   APP_DIR=/var/www/gmao-suite/current
#   RETENTION_DAYS=14
#   BACKUP_ROOT=/var/backups/gmao-suite

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/gmao-suite/current}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/gmao-suite}"
ENV_FILE="${APP_DIR}/.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}"
  exit 1
fi

if [[ ! -d "${APP_DIR}/node_modules" ]]; then
  echo "Missing node_modules in ${APP_DIR} (run npm ci) or set DATABASE_URL in the environment."
  exit 1
fi

DATABASE_URL="$(cd "${APP_DIR}" && node -e "require('dotenv').config({ path: '.env' }); const u = process.env.DATABASE_URL; if (!u) process.exit(1); console.log(u)")"

mkdir -p "${BACKUP_ROOT}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${BACKUP_ROOT}/gmao_suite-${STAMP}.sql.gz"

# pg_dump accepte une URI postgresql://...
if ! command -v pg_dump >/dev/null 2>&1; then
  echo "Install postgresql-client: apt install -y postgresql-client"
  exit 1
fi

pg_dump "${DATABASE_URL}" | gzip -9 >"${OUT}"
chmod 600 "${OUT}"
echo "Backup written: ${OUT}"

if [[ "${RETENTION_DAYS}" =~ ^[0-9]+$ ]] && [[ "${RETENTION_DAYS}" -gt 0 ]]; then
  find "${BACKUP_ROOT}" -maxdepth 1 -name 'gmao_suite-*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -delete
  echo "Removed backups older than ${RETENTION_DAYS} days under ${BACKUP_ROOT}"
fi
