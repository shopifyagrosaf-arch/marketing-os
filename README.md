# Agrosaf Marketing OS

Internal AI Marketing Content Operating System for Agrosaf Group — unifies content
planning, AI-assisted drafting, brand/compliance approval, publishing, and
analytics across the group's four brands (Agrosaf Pharmaceuticals, Alosafe
Pharmacare, Medizone, Hospital Marketing), operated by one shared marketing team.

**Status:** UI Preview — a mock-data-only frontend covering 11 internal
tool modules, tagged `v0.3.0-ui-preview`, built for same-day review. This
pauses (does not delete) the multi-tenant NestJS/Postgres backend and
design system from Sprints 1–3A/3B (tagged `v0.3.0-sprint3`) — see
[ADR 0011](docs/adr/0011-ui-preview-mock-data-pivot.md) and
[`docs/SPRINT_UI_PREVIEW.md`](docs/SPRINT_UI_PREVIEW.md) for the pivot
rationale and current scope. See [`ROADMAP.md`](ROADMAP.md) for what's next
and [`CHANGELOG.md`](CHANGELOG.md) for release history.

## Documentation

- [`ROADMAP.md`](ROADMAP.md) — phased delivery plan and current sprint status
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, tenancy
  model, RBAC, auth flow, content request workflow
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — `packages/ui` tokens,
  component inventory, and consumption details
- [`docs/adr/`](docs/adr/) — Architecture Decision Records (the *why* behind
  each significant technical choice)
- [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) — annotated repo tree
- [`docs/SPRINT_1.md`](docs/SPRINT_1.md) / [`docs/SPRINT_2.md`](docs/SPRINT_2.md) / [`docs/SPRINT_3A.md`](docs/SPRINT_3A.md) / [`docs/SPRINT_3B.md`](docs/SPRINT_3B.md) — per-sprint scope, endpoints, and review findings (the paused backend/design-system path)
- [`docs/SPRINT_UI_PREVIEW.md`](docs/SPRINT_UI_PREVIEW.md) — the current mock-data UI build: scope, modules, and what's dormant
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branching, commit, and review conventions
- [`CHANGELOG.md`](CHANGELOG.md) — release history (Keep a Changelog format)
- [`LICENSE`](LICENSE) — MIT

## Monorepo layout

```
apps/
  api/    NestJS backend (REST API, Prisma/PostgreSQL, RBAC, auth verification, content request workflow)
  web/    Next.js frontend (Auth.js SSO, brand switcher, admin dashboard, content requests)
packages/
  shared-types/   Types/constants shared between api and web
  ui/             Design system (tokens + components) — see docs/DESIGN_SYSTEM.md
docker/
  docker-compose.yml   Local Postgres + Redis
.github/workflows/     CI (lint, test, build, per workspace)
docs/                  Architecture & sprint documentation
```

## Running the current UI Preview

The steps below (`docker compose`, Postgres, migrations, seed) are for the
paused backend/Sprint 1–3 path. The current UI Preview build needs none of
that — it's mock data only:

```bash
npm install
npm run dev --workspace=apps/web   # http://localhost:3000
```

Sign in as any seeded user on the login screen (no password/SSO). See
[`docs/SPRINT_UI_PREVIEW.md`](docs/SPRINT_UI_PREVIEW.md) for details.

## Prerequisites (backend path — currently paused)

- Node.js >= 20
- npm >= 10 (workspaces)
- Docker (for local Postgres/Redis) — optional if you point `DATABASE_URL` /
  `REDIS_URL` at existing instances instead

## Getting started

```bash
# 1. Install all workspace dependencies
npm install

# 2. Copy env template and fill in secrets
cp .env.example .env
#   - AUTH_SECRET: any random string >= 32 chars (shared between apps/api and apps/web)
#   - AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET, or AUTH_MICROSOFT_ENTRA_* for SSO

# 3. Start local Postgres + Redis
docker compose -f docker/docker-compose.yml up -d

# 4. Generate the Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# 5. Seed the organization, 4 brands, 14 roles, and a Super Admin user
SEED_SUPER_ADMIN_EMAIL=you@agrosafpharmaceuticals.com npm run prisma:seed

# 6. Run both apps (separate terminals)
npm run dev:api   # http://localhost:3001
npm run dev:web   # http://localhost:3000
```

Sign in with the email you set as `SEED_SUPER_ADMIN_EMAIL` to reach
`/admin` — the Admin Dashboard (Users, Roles, Permissions, Brands,
Organization) is gated to Super Admin/Marketing Head (see `docs/SPRINT_2.md`).

## Testing

```bash
npm run test --workspace=apps/api            # unit tests
npm run test:e2e --workspace=apps/api         # e2e tests (guard chain, auth)
npm run test --workspace=apps/web             # frontend unit tests
npm run test --workspace=packages/ui          # design system component tests
```

## Development workflow

This project is being built sprint-by-sprint against an approved SRS/PRD/
Architecture (not in this repo — produced and agreed upon before Sprint 1).
Each sprint's scope, endpoints, and known limitations are documented under
`docs/`. Do not add functionality ahead of the current sprint's approved scope.
