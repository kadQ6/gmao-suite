# GMAO Suite (Option B)

Application Next.js pour suivi de projet + maintenance (GMAO).

## Stack

- Next.js (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS
- API routes pretes dans `src/app/api`

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
- Login admin: `/login`
- Zone admin protegee: `/admin`

## Scripts utiles

- `npm run db:up` : demarre PostgreSQL
- `npm run db:down` : arrete et supprime les volumes
- `npm run db:push` : pousse le schema Prisma
- `npm run db:migrate` : cree/applique une migration
- `npm run db:seed` : injecte les donnees de demo
- `npm run db:studio` : interface Prisma Studio
- `npm run check:env` : valide les variables critiques
- `npm run check:predeploy` : checks globaux pre-prod

## Acces admin par defaut (a changer)

- Email: `admin@kbio-conseil.com`
- Password: `ADMIN_SEED_PASSWORD` (defaut `Admin@12345`)

## Routes principales

- `/` : dashboard KPI
- `/projects` : suivi des projets
- `/tasks` : suivi des taches
- `/assets` : equipements
- `/work-orders` : ordres de travail

## API

- `/api/health`
- `/api/projects`
- `/api/tasks`
- `/api/assets`
- `/api/work-orders`
