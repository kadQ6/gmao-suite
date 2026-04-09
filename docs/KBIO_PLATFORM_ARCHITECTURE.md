# K'BIO Platform - Architecture Blueprint (Phase 1)

## 1) Product Scope

Build a B2B SaaS platform integrated into `kbio-conseil.com` with:
- Internal K'BIO workspace (write permissions)
- Client workspace (strict read-only)
- Project management
- GMAO module
- Project tracking / action plans
- Project documents
- Executive dashboards

Primary rule: client users only see their own projects and cannot mutate operational data.

## 2) Functional Domains

### A. Identity & Access
- Authentication (email/password + optional SSO later)
- Role-based access control (RBAC)
- Multi-tenant scoping by client membership
- Read-only enforcement for client role

### B. Core Business
- Clients and client users
- Projects and memberships
- Project updates and history
- Documents with visibility flags

### C. GMAO
- Equipment inventory
- Categories and locations
- Maintenance plans
- Interventions and alerts

### D. Project Tracking
- Action plans
- Project actions (status, priority, due dates, assignees)
- Milestones
- Visibility controls (internal vs client-visible)

### E. Analytics
- Global dashboard
- Project dashboard
- KPI cards + trend charts + upcoming deadlines + alert board

## 3) Technical Architecture

### Frontend
- Next.js App Router + TypeScript + Tailwind + shadcn/ui
- Feature-oriented folders (`modules/*`)
- Reusable dashboard widgets
- Server components by default; client components only when needed

### Backend
- Next.js Route Handlers and/or Server Actions for internal operations
- Validation with Zod (input and output contracts)
- Domain services layer (no direct DB calls in UI)

### Data Layer (Target)
- Existing PostgreSQL database (same infra already used by the project)
- Prisma ORM + Prisma Client for schema, queries, and type-safe access
- NextAuth (credentials) for authentication and role propagation in session/JWT
- Local/object storage abstraction for project documents (S3-compatible can be added later)

### Security
- Route protection middleware
- Permission checks in every server-side mutation
- Tenant isolation enforced in application service layer + query filters
- Activity logs for security/audit events

## 4) Roles & Permissions Matrix

- `SUPER_ADMIN`: full platform access
- `ADMIN_KBIO`: full internal operations except super-admin-only governance
- `PROJECT_MANAGER`: manage assigned projects, actions, documents, GMAO scoped
- `TECHNICIAN`: contribute interventions/actions per assignment
- `CLIENT_READONLY`: read-only, own projects only

Mutation policy:
- Allowed: super admin, admin, PM, technician (scoped)
- Denied: client_readonly (all write endpoints)

Visibility policy:
- Client sees only records where `visible_to_client = true` and project linked to user's client account

## 5) Database Schema (Target)

Core tables:
- `roles(id, code, label, created_at, updated_at)`
- `users(id, email, name, role_id, active, created_at, updated_at)`
- `clients(id, code, name, country, created_at, updated_at)`
- `client_users(id, client_id, user_id, created_at)`
- `projects(id, code, name, client_id, country, site, type, status, priority, start_date, end_date, progress, budget, manager_id, created_at, updated_at)`
- `project_members(id, project_id, user_id, role_in_project, created_at)`
- `project_updates(id, project_id, title, body, visible_to_client, created_by, created_at)`

GMAO:
- `equipment_categories(id, name, created_at, updated_at)`
- `equipment(id, project_id, category_id, site, location, code, name, model, manufacturer, serial_number, status, criticality, maintenance_class, installed_at, last_maintenance_at, next_maintenance_at, visible_to_client, created_at, updated_at)`
- `maintenance_plans(id, project_id, equipment_id, periodicity_days, checklist, active, created_at, updated_at)`
- `interventions(id, project_id, equipment_id, type, status, planned_at, started_at, completed_at, summary, internal_notes, visible_to_client, created_by, created_at, updated_at)`

Tracking:
- `action_plans(id, project_id, title, description, status, created_at, updated_at)`
- `project_actions(id, action_plan_id, project_id, title, description, status, priority, due_date, assignee_id, blocked_reason, visible_to_client, created_at, updated_at)`
- `milestones(id, project_id, title, due_date, status, visible_to_client, created_at, updated_at)`

Documents & Ops:
- `project_documents(id, project_id, category, name, storage_path, mime_type, size_bytes, visible_to_client, uploaded_by, created_at, updated_at)`
- `alerts(id, project_id, equipment_id, action_id, level, message, status, created_at, updated_at)`
- `activity_logs(id, user_id, project_id, entity, entity_id, action, metadata_json, ip, created_at)`

## 6) Routing Map (Target)

Public:
- `/`, `/a-propos`, `/services`, `/contact`, `/login`

Private:
- `/dashboard`
- `/projects`
- `/projects/[id]`
- `/projects/[id]/overview`
- `/projects/[id]/gmao`
- `/projects/[id]/project-tracking`
- `/projects/[id]/documents`
- `/projects/[id]/history`
- `/equipment`
- `/actions`
- `/settings`
- `/admin`
- `/admin/clients`
- `/admin/projects`
- `/admin/users`
- `/admin/documents`

## 7) Delivery Plan

### Phase 1 (current)
- Architecture, data model, RBAC rules, route map
- Initial app scaffolding and protected routes

### Phase 2
- Prisma schema evolution based on existing DB
- Auth/role integration and tenant scoping with NextAuth + service guards
- Seed demo data aligned with K'BIO use cases

### Phase 3
- Functional modules: Dashboard, Projects, GMAO, Tracking, Documents
- Read-only client surfaces and internal mutation workflows

### Phase 4
- UX polish, observability, tests, deployment hardening, runbooks

## 8) Migration Note from Existing `/portal`

Current `/portal` remains available temporarily.
New platform pages are introduced on canonical paths (`/dashboard`, `/projects`, `/admin`, etc.).
After feature parity validation, remove/deprecate legacy `/portal`.
