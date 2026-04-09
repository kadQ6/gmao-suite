# Deploy Hostinger VPS - kbio-conseil.com

## 1) Prerequis VPS

- Ubuntu 22.04+ (ou equivalent)
- Node.js 20 LTS
- PostgreSQL 16 (local ou managé)
- Nginx
- PM2
- Acces sudo

## 2) Provision serveur

```bash
sudo bash deploy/vps-bootstrap.sh
```

## 3) Deploy application

```bash
sudo mkdir -p /var/www/gmao-suite
sudo chown -R $USER:$USER /var/www/gmao-suite
git clone <TON_REPO_GIT> /var/www/gmao-suite/current
cd /var/www/gmao-suite/current
npm ci
cp .env.example .env
```

Configurer `.env` avec les vraies valeurs prod:

- `DATABASE_URL` (DB prod)
- `NEXTAUTH_URL=https://kbio-conseil.com`
- `NEXTAUTH_SECRET` (long secret aleatoire)

## 4) Base de donnees

```bash
npm run db:migrate:deploy
npm run db:seed
```

En developpement local uniquement : `npm run db:migrate` (`prisma migrate dev`).

## 5) Verifications pre-deploiement

```bash
npm run check:predeploy
```

## 6) Mettre a jour le code puis republier

Sur le VPS (compte deploy), depuis le repertoire de l’app :

```bash
cd /var/www/gmao-suite/current
git pull
sudo bash deploy/publish-vps.sh
```

Le script installe les deps, applique les migrations (`db:migrate:deploy`), seed, verifie l’environnement, rebuild et redemarre PM2.

## 7) Nginx

```bash
sudo cp deploy/nginx.kbio-conseil.com.conf /etc/nginx/sites-available/kbio-conseil.com
sudo ln -s /etc/nginx/sites-available/kbio-conseil.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 8) SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kbio-conseil.com -d www.kbio-conseil.com
```

## 9) DNS Hostinger

- Type `A` pour `@` vers IP VPS
- Type `A` pour `www` vers IP VPS
- Attendre propagation

## 10) Validation finale

- `https://kbio-conseil.com/api/health` doit repondre `ok: true`
- Site public: `/`, `/services`, `/contact`
- Portail (apres login): `/portal`, `/portal/projects`, etc.
