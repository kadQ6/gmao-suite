#!/usr/bin/env bash
# Met à jour le code (git pull) puis republie l'app (npm, migrate, build, PM2).
# À lancer sur le VPS depuis le dépôt cloné :
#   cd /var/www/gmao-suite/current && bash deploy/update-from-git.sh
#
# Si le dépôt est privé, configure une clé SSH deploy ou un token (voir doc).

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  echo "Not a git repo: ${APP_DIR}"
  exit 1
fi

cd "${APP_DIR}"
git pull --ff-only

if [[ "${EUID}" -eq 0 ]]; then
  bash "${APP_DIR}/deploy/publish-vps.sh"
else
  sudo bash "${APP_DIR}/deploy/publish-vps.sh"
fi

echo "Update complete."
