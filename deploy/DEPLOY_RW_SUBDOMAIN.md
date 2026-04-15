# Deployer PSA Rwanda sur rw.kbio-conseil.com

## Prerequis

- L'app principale (gmao-suite) tourne deja sur le VPS Hostinger
- PM2 gere le processus sur le port 3000
- Nginx est installe et sert kbio-conseil.com
- Acces SSH root au VPS

## Etape 1 : DNS Hostinger

Dans le panneau DNS de Hostinger, ajouter un enregistrement :

| Type | Nom  | Valeur         | TTL  |
|------|------|----------------|------|
| A    | rw   | (IP du VPS)    | 3600 |

Attendre la propagation DNS (5-30 min).

Verifier : `dig rw.kbio-conseil.com` doit retourner l'IP du VPS.

## Etape 2 : Deployer sur le VPS

```bash
ssh root@(IP_VPS)
cd /var/www/gmao-suite/current

# Recuperer le code a jour
git pull --ff-only

# Lancer le script de deploiement
sudo bash deploy/deploy-rw-subdomain.sh
```

Le script fait automatiquement :
1. `npm ci` (installation dependances)
2. `prisma db push` (migration schema — ajoute les tables PSA)
3. `npm run build` (compilation Next.js)
4. Redemarrage PM2
5. Configuration Nginx pour rw.kbio-conseil.com
6. Reload Nginx

## Etape 3 : SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d rw.kbio-conseil.com
```

## Etape 4 : Partager les cookies d'auth

Ajouter dans `/var/www/gmao-suite/current/.env` :

```
COOKIE_DOMAIN=".kbio-conseil.com"
```

Puis redemarrer :

```bash
pm2 restart gmao-suite
```

Cela permet de se connecter sur kbio-conseil.com et d'etre automatiquement connecte sur rw.kbio-conseil.com (meme session).

## Etape 5 : Injecter les donnees PSA

```bash
curl -X POST https://rw.kbio-conseil.com/api/psa-rwanda/seed
```

Cela injecte :
- 3 sites PSA Rwanda (Kibagabaga, Rwamagana, Nyagatare)
- 21 equipements avec statuts
- 22 fiches de maintenance
- 16 besoins en pieces detachees

## Etape 6 : Verification

1. Ouvrir https://rw.kbio-conseil.com → redirige vers /portal/psa-rwanda
2. Se connecter avec admin@kbio-conseil.com
3. Verifier les 3 sites PSA, les equipements, le dashboard

## Architecture

```
rw.kbio-conseil.com
       │
       ▼
    Nginx (port 80/443)
       │  location = / → redirect /portal/psa-rwanda
       │  location / → proxy_pass :3000
       ▼
    PM2 → Next.js (port 3000)  ← meme instance que kbio-conseil.com
       │
       ▼
    PostgreSQL (gmao_suite)
       └── Tables: PsaSite, PsaEquipment, PsaMaintenance, PsaPieceNeed
```

## Acces

| URL | Description |
|-----|-------------|
| https://rw.kbio-conseil.com | Redirige vers PSA Rwanda |
| https://rw.kbio-conseil.com/portal/psa-rwanda | Vue d'ensemble des 3 sites |
| https://rw.kbio-conseil.com/portal/psa-rwanda/dashboard | Dashboard consolide |
| https://rw.kbio-conseil.com/portal/psa-rwanda/sites/{id} | Detail d'un site |
| https://rw.kbio-conseil.com/portal/psa-rwanda/sites/{id}/pieces | Pieces detachees du site |
