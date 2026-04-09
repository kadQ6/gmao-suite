#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/gmao-suite/current"

if [[ ! -d "${APP_DIR}" ]]; then
  echo "Missing app dir: ${APP_DIR}"
  exit 1
fi

cd "${APP_DIR}"

npm ci
npm run db:migrate:deploy
npm run db:seed
npm run check:predeploy

pm2 start ecosystem.config.cjs --update-env || pm2 restart gmao-suite --update-env
pm2 save

nginx -t
systemctl reload nginx

echo "Publish complete."
