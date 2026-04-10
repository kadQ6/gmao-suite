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

**Comptes mot de passe** : le seed ne reinitialise plus les mots de passe admin / client existants a chaque publication (seulement a la creation du compte). Sur une **premiere** installation, definir `ADMIN_SEED_PASSWORD` et `CLIENT_SEED_PASSWORD` dans `.env` avant le premier seed, ou utiliser les defauts du fichier `prisma/seed.ts`.

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

## 11) Mise a jour code (git pull + build)

Sur le VPS :

```bash
cd /var/www/gmao-suite/current
bash deploy/update-from-git.sh
```

(`update-from-git.sh` fait `git pull --ff-only` puis `deploy/publish-vps.sh` en root ou via `sudo`.)

## 12) Sauvegardes PostgreSQL

Installer le client si besoin : `sudo apt install -y postgresql-client`

```bash
cd /var/www/gmao-suite/current
sudo bash deploy/backup-db.sh
```

Les fichiers vont sous `/var/backups/gmao-suite/` (gzip), avec suppression des sauvegardes de plus de **14 jours** (variable `RETENTION_DAYS`).

**Cron** (ex. tous les jours a 3h15) :

```bash
sudo crontab -e
```

Ligne :

```
15 3 * * * bash /var/www/gmao-suite/current/deploy/backup-db.sh >>/var/log/gmao-backup.log 2>&1
```

Pense a **copier les `.sql.gz` hors du VPS** (stockage externe) pour survivre a une panne disque.

## 13) Durcir SSH

Procedure detaillee (cles, tests, puis sshd) : **`deploy/HARDEN_SSH.md`**.

Fichier modele : `deploy/sshd-hardening.conf.example` → copie vers `/etc/ssh/sshd_config.d/` apres verification des cles.

## 14) Pare-feu (rappel)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

Verifier aussi le **firewall** dans hPanel Hostinger (ports 22, 80, 443).
