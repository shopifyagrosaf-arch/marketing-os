# Folder Structure

Generated against the actual repo tree as of `v0.1.0-foundation` — regenerate
this file (don't hand-edit it stale) whenever a sprint adds a new top-level
module or restructures an existing one.

```
MarketingOS/
├── apps/
│   ├── api/                          NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma         Organization/Brand/User/Role/... models
│   │   │   ├── seed.ts               Seeds org + 4 brands + 14 roles + Super Admin
│   │   │   └── migrations/
│   │   │       ├── migration_lock.toml
│   │   │       └── 20260711123339_init/migration.sql
│   │   ├── src/
│   │   │   ├── main.ts               Bootstrap: Helmet, CORS, ValidationPipe, filters
│   │   │   ├── app.module.ts         Wires every module + global guards/interceptors
│   │   │   ├── config/
│   │   │   │   └── env.validation.ts Fails fast at boot on missing/invalid env vars
│   │   │   ├── types/
│   │   │   │   └── express.d.ts      Express.Request/User type augmentation
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts  @Global — PrismaService available everywhere
│   │   │   │   └── prisma.service.ts
│   │   │   ├── common/               Cross-cutting, not feature-specific
│   │   │   │   ├── decorators/       @Public, @Roles, @OrgRoles, @CurrentUser, @CurrentBrand
│   │   │   │   ├── guards/           JwtAuthGuard, BrandAccessGuard, RolesGuard, OrgRoleGuard (+ .spec.ts siblings)
│   │   │   │   ├── filters/          HttpExceptionFilter (consistent error shape + 5xx logging)
│   │   │   │   └── interceptors/     LoggingInterceptor (method/path/duration/user/brand)
│   │   │   └── modules/              One folder per feature; each owns its controller/service/module(/dto)
│   │   │       ├── auth/             SSO token verification, user provisioning
│   │   │       │   └── strategies/   passport-jwt strategy
│   │   │       ├── organizations/
│   │   │       ├── brands/
│   │   │       │   └── dto/
│   │   │       ├── roles/            Read-only in Sprint 1
│   │   │       └── health/           Public liveness check
│   │   ├── test/                     e2e specs — real HTTP requests through the full Nest app
│   │   │   ├── jest-e2e.json
│   │   │   ├── jest-e2e.setup.ts     Env vars set here, NOT in spec files (see docs/SPRINT_1.md)
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── brands.e2e-spec.ts    Full RBAC guard-chain integration test
│   │   ├── package.json / tsconfig.json / nest-cli.json / .eslintrc.js / .prettierrc.js
│   │
│   └── web/                          Next.js frontend (App Router)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        Root layout
│       │   │   ├── (auth)/login/     SSO-only login (no local credentials)
│       │   │   ├── (dashboard)/      Protected shell: layout (brand switcher), page, loading, error
│       │   │   └── api/
│       │   │       ├── auth/[...nextauth]/route.ts   Auth.js handlers
│       │   │       └── proxy/[...path]/route.ts       Same-origin proxy to the NestJS API
│       │   ├── components/
│       │   │   └── brand-switcher/   BrandProvider (context + fetch) + BrandSwitcher (UI)
│       │   ├── lib/
│       │   │   ├── auth.ts           NextAuth() config (Google + Microsoft Entra ID)
│       │   │   ├── api-token.ts      server-only: mints the short-lived API JWT
│       │   │   └── api-client.ts     Client-side fetch wrapper → always hits /api/proxy
│       │   └── middleware.ts         Redirects unauthenticated page navigation to /login
│       ├── package.json / tsconfig.json / next.config.js / .eslintrc.json / jest.config.js
│
├── packages/
│   └── shared-types/                 Types/constants shared between api and web
│       └── src/index.ts              ROLE_NAMES, ORG_WIDE_ROLES, BrandSummary
│
├── docker/
│   └── docker-compose.yml            Local Postgres 16 + Redis 7
│
├── .github/workflows/
│   └── ci.yml                        Lint/test/build per workspace; api job runs against real Postgres
│
├── docs/
│   ├── ARCHITECTURE.md               System design: tenancy, RBAC, auth flow, tech stack
│   ├── FOLDER_STRUCTURE.md           This file
│   ├── SPRINT_1.md                   Sprint 1 scope, endpoints, review findings
│   └── adr/                          Architecture Decision Records (0001-0007 + template)
│
├── README.md / CHANGELOG.md / CONTRIBUTING.md / LICENSE
├── package.json                      Root — npm workspaces (apps/*, packages/*)
├── .env.example
└── .gitignore
```

## Conventions this structure encodes

- **`apps/api/src/modules/<feature>/`** always follows the same internal
  shape: `<feature>.module.ts`, `<feature>.controller.ts`,
  `<feature>.service.ts`, optionally `dto/`. A new feature module should
  match this shape rather than inventing a new one.
- **`apps/api/src/common/`** is for guards/decorators/filters/interceptors
  used by *more than one* module. Feature-specific logic does not belong
  here even if it feels reusable in theory — move it here only once a
  second module actually needs it.
- **Tests live next to what they test** (`*.spec.ts` beside the source file)
  for unit tests; **e2e tests live in `apps/api/test/`** since they exercise
  the whole app, not one file.
- **`docs/adr/`** holds decisions, **`docs/SPRINT_N.md`** holds
  per-sprint scope/history — don't mix the two (an ADR shouldn't read like a
  changelog entry, and a sprint doc shouldn't need to justify a decision from
  scratch — it should link to the relevant ADR instead).
