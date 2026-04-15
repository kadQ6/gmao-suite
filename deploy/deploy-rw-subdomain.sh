#!/usr/bin/env bash
# ============================================================
# Deploy PSA Rwanda on rw.kbio-conseil.com
# ============================================================
# This script configures the rw.kbio-conseil.com subdomain
# to serve the PSA Rwanda audit application.
#
# Prerequisites:
#   - The main app (gmao-suite) is already deployed on the VPS
#   - PM2 is running the app on port 3000
#   - Nginx is installed and serving kbio-conseil.com
#   - DNS A record for rw.kbio-conseil.com points to VPS IP
#
# Usage (on VPS as root or sudo):
#   sudo bash deploy/deploy-rw-subdomain.sh
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
DOMAIN="rw.kbio-conseil.com"

echo "============================================"
echo " Deploying PSA Rwanda → ${DOMAIN}"
echo "============================================"

# ── Step 1: Update app code & rebuild ──────────────────────
echo ""
echo "[1/6] Updating application code..."
cd "${APP_DIR}"

if [[ -d ".git" ]]; then
  git pull --ff-only || echo "  (git pull skipped — manual copy mode)"
fi

echo "[2/6] Installing dependencies..."
npm ci

echo "[3/6] Running database migrations..."
npx prisma db push --accept-data-loss 2>/dev/null || npx prisma migrate deploy

echo "[4/6] Building application..."
npm run build

echo "[5/6] Restarting PM2..."
pm2 restart gmao-suite --update-env 2>/dev/null || pm2 start ecosystem.config.cjs --update-env
pm2 save

# ── Step 2: Configure Nginx for subdomain ──────────────────
echo ""
echo "[6/6] Configuring Nginx for ${DOMAIN}..."

NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
NGINX_LINK="/etc/nginx/sites-enabled/${DOMAIN}"

cp "${SCRIPT_DIR}/nginx.rw.kbio-conseil.com.conf" "${NGINX_CONF}"

if [[ ! -L "${NGINX_LINK}" ]]; then
  ln -s "${NGINX_CONF}" "${NGINX_LINK}"
fi

nginx -t
systemctl reload nginx

# ── Step 3: SSL with Let's Encrypt ─────────────────────────
echo ""
echo "============================================"
echo " Nginx configured for ${DOMAIN}"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "  1. Ensure DNS A record for ${DOMAIN} points to this server IP"
echo ""
echo "  2. Install SSL certificate:"
echo "     sudo certbot --nginx -d ${DOMAIN}"
echo ""
echo "  3. Add ${DOMAIN} to NEXTAUTH_URL if needed:"
echo "     Edit .env → NEXTAUTH_URL should include the main domain"
echo ""
echo "  4. Seed PSA data (if first deploy):"
echo "     curl -X POST https://${DOMAIN}/api/psa-rwanda/seed"
echo ""
echo "  5. Test:"
echo "     curl -I https://${DOMAIN}"
echo "     → Should redirect to /portal/psa-rwanda"
echo ""
echo "  Login: admin@kbio-conseil.com / (your admin password)"
echo ""
echo "============================================"
echo " Deploy complete!"
echo "============================================"
