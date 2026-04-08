# K'BIO — Site public + portail client (gmao-suite)

Application Next.js : vitrine institutionnelle K'BIO et portail connecte (suivi projet, GMAO).

## Stack

- Next.js (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS
- NextAuth (portail)

## Structure des URLs

- **Site public (vitrine)** : `/`, `/a-propos`, `/services`, `/references`, `/contact`, `/login`
- **Portail client (apres connexion)** : `/portal`, `/portal/projects`, `/portal/tasks`, `/portal/assets`, `/portal/work-orders`, `/portal/admin`

## Lancement rapide

1. Copier les variables d'environnement:

```bash
cp .env.example .env
```

2. Demarrer la base PostgreSQL:

```bash
npm run db:up
```

3. Initialiser la base:

```bash
npm run db:push
npm run db:seed
```

4. Demarrer l'application:

```bash
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Production

- Runbook complet: `deploy/DEPLOY_HOSTINGER_VPS.md`
- Exemple Nginx: `deploy/nginx.kbio-conseil.com.conf`
- Validation avant mise en ligne: `npm run check:predeploy`
- Connexion portail: `/login` puis redirection vers `/portal`

## Scripts utiles

- `npm run db:up` : demarre PostgreSQL
- `npm run db:down` : arrete et supprime les volumes
- `npm run db:push` : pousse le schema Prisma
- `npm run db:migrate` : cree/applique une migration
- `npm run db:seed` : injecte les donnees de demo
- `npm run db:studio` : interface Prisma Studio
- `npm run check:env` : valide les variables critiques
- `npm run check:predeploy` : checks globaux pre-prod

## Acces compte demo (a changer en production)

- Email: `admin@kbio-conseil.com`
- Password: `ADMIN_SEED_PASSWORD` (voir `.env`)

## API

- `/api/health`
- `/api/contact` (formulaire vitrine — Phase A: accusé de réception JSON)
- `/api/projects`, `/api/tasks`, `/api/assets`, `/api/work-orders` (protégées par session)
- `/api/auth/*`
