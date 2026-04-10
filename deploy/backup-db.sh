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

# Ne pas utiliser console.log : certains outils injectent du texte sur stdout (ex. symboles de debug),
# ce qui casse l'URI passee a pg_dump.
TMPFILE="$(mktemp)"
chmod 600 "${TMPFILE}"
trap 'rm -f "${TMPFILE}"' EXIT

(
  cd "${APP_DIR}"
  BACKUP_TMPFILE="${TMPFILE}" node --no-warnings -e "
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
let u = process.env.DATABASE_URL;
if (!u || typeof u !== 'string') process.exit(1);
u = u.trim().replace(/^\\uFEFF/, '');
if (/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]/.test(u)) process.exit(1);
fs.writeFileSync(process.env.BACKUP_TMPFILE, u, 'utf8');
"
)

DATABASE_URL="$(tr -d '\r' <"${TMPFILE}" | head -1)"

if [[ -z "${DATABASE_URL}" ]] || [[ "${DATABASE_URL}" != postgresql* ]]; then
  echo "Could not read a valid DATABASE_URL from ${ENV_FILE}"
  exit 1
fi

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
