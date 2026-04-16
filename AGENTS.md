# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Cursor Cloud specific instructions

### Services overview

This is a **Next.js 16 + Prisma + PostgreSQL** monolith (GMAO Suite for K'BIO biomedical consulting). There are only two services to run:

| Service | Command | Notes |
|---------|---------|-------|
| PostgreSQL 16 | `sudo docker compose up -d` | Must be running before anything else. Uses `postgres:16-alpine` on port 5432 |
| Next.js dev server | `npm run dev` | Port 3000 — serves both frontend and API routes |

### Quick start (after update script has run)

1. Start PostgreSQL: `sudo docker compose up -d`
2. Push schema if needed: `npx prisma db push`
3. Seed demo data (idempotent): `npx prisma db seed`
4. Start dev server: `npm run dev`

### Key gotchas

- **Docker requires `sudo`** in Cloud Agent VMs (the `ubuntu` user is in the `docker` group but the socket still requires `sudo` for `docker compose` commands).
- **Docker daemon may not be running** on fresh VMs. Start it with `sudo dockerd &>/tmp/dockerd.log &` and wait a few seconds before running `docker compose`.
- The `.env` file must have `NEXTAUTH_URL="http://localhost:3000"` for local dev (the `.env.example` ships with the production URL).
- `npx prisma db push` is preferred over `npx prisma migrate dev` for quick dev setup (the README recommends `db:push`).
- The Prisma seed is idempotent (uses `upsert` everywhere) — safe to re-run.
- Demo login: `admin@kbio-conseil.com` / password from `ADMIN_SEED_PASSWORD` env var (default `Admin@12345`).

### Lint / typecheck / build

See `package.json` scripts. Key commands:
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — production build
- `npm run check:predeploy` — runs env check + lint + typecheck + build