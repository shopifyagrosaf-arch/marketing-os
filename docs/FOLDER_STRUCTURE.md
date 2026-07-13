# Folder Structure

Generated against the actual repo tree as of Sprint 3B — regenerate this
file (don't hand-edit it stale) whenever a sprint adds a new top-level
module or restructures an existing one.

```
MarketingOS/
├── apps/
│   ├── api/                          NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma         Organization/Brand/User/Role/Permission/ContentRequest/... models
│   │   │   ├── seed.ts               Seeds org + 4 brands + 14 roles + Super Admin
│   │   │   └── migrations/
│   │   │       ├── migration_lock.toml
│   │   │       ├── 20260711123339_init/migration.sql
│   │   │       ├── 20260711131402_role_organization_scoping/migration.sql
│   │   │       └── 20260711140000_content_request_intake/migration.sql
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
│   │   │   │   ├── interceptors/     LoggingInterceptor (method/path/duration/user/brand)
│   │   │   │   ├── audit/            AuditLogService — every module's audit trail writes go through this
│   │   │   │   ├── services/         OrgAccessService — single source of truth for "org-wide role" lookups
│   │   │   │   └── common.module.ts  @Global — exports AuditLogService + OrgAccessService
│   │   │   └── modules/              One folder per feature; each owns its controller/service/module(/dto)
│   │   │       ├── auth/             SSO token verification, user provisioning
│   │   │       │   └── strategies/   passport-jwt strategy
│   │   │       ├── organizations/    incl. dto/ (update)
│   │   │       ├── brands/           incl. dto/ (create, update); admin + self-service endpoints
│   │   │       ├── users/            incl. dto/ (create, update, status, grant-brand-access, list-query)
│   │   │       ├── roles/            Full CRUD for custom roles; built-in roles immutable; incl. dto/
│   │   │       ├── permissions/      incl. dto/ (create)
│   │   │       ├── content-requests/ Intake + workflow engine skeleton (Sprint 3B, see docs/adr/0010)
│   │   │       │   ├── content-request-workflow.ts        Transition table + assertValidContentRequestTransition (+ .spec.ts)
│   │   │       │   └── dto/          create, update, update-status, list-query
│   │   │       └── health/           Public liveness check
│   │   ├── test/                     e2e specs — real HTTP requests through the full Nest app
│   │   │   ├── jest-e2e.json
│   │   │   ├── jest-e2e.setup.ts     Env vars set here, NOT in spec files (see docs/SPRINT_1.md)
│   │   │   ├── app.e2e-spec.ts
│   │   │   ├── brands.e2e-spec.ts    Brand-scoped RBAC chain (BrandAccessGuard+RolesGuard)
│   │   │   ├── users.e2e-spec.ts     Org-wide RBAC chain (OrgRoleGuard)
│   │   │   └── content-requests.e2e-spec.ts  Brand-scoped RBAC chain (BrandAccessGuard only, no @Roles)
│   │   ├── package.json / tsconfig.json / nest-cli.json / .eslintrc.js / .prettierrc.js
│   │
│   └── web/                          Next.js frontend (App Router)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        Root layout — imports @agrosaf/ui/tokens.css globally
│       │   │   ├── (auth)/login/     SSO-only login (no local credentials)
│       │   │   ├── (dashboard)/      Protected shell: layout (AppHeader + BrandProvider), page, loading, error
│       │   │   │   ├── admin/        Server-gated (Super Admin/Marketing Head only)
│       │   │   │   │   ├── layout.tsx        Redirects non-admins; renders AdminSidebar
│       │   │   │   │   ├── page.tsx          Overview (counts)
│       │   │   │   │   ├── users/            List (paginated), pre-provision, activate/suspend
│       │   │   │   │   │   └── [id]/         Brand-access grant/revoke
│       │   │   │   │   ├── roles/            List, create custom role + permission checklist
│       │   │   │   │   ├── permissions/      List, create
│       │   │   │   │   ├── brands/           List, create, inline edit
│       │   │   │   │   └── organization/     Org settings form
│       │   │   │   └── content-requests/     Intake UI (Sprint 3B) — open to every authenticated user, not admin-gated
│       │   │   │       └── [id]/              Detail: edit (DRAFT only) + status transition actions
│       │   │   └── api/
│       │   │       ├── auth/[...nextauth]/route.ts   Auth.js handlers
│       │   │       └── proxy/[...path]/route.ts       Same-origin proxy to the NestJS API
│       │   ├── components/
│       │   │   ├── brand-switcher/   BrandProvider (context + fetch) + BrandSwitcher (UI, built on @agrosaf/ui)
│       │   │   └── shell/            Admin UI Foundation (Sprint 3A) — app-specific, built on @agrosaf/ui:
│       │   │       ├── AppHeader.tsx      Top bar: brand mark, nav, brand switcher, sign out
│       │   │       ├── AdminSidebar.tsx   /admin/* section nav
│       │   │       └── PageHeader.tsx     Title (+ description/actions) row for every page
│       │   ├── lib/
│       │   │   ├── auth.ts           NextAuth() config (Google + Microsoft Entra ID)
│       │   │   ├── api-token.ts      server-only: mints the short-lived API JWT
│       │   │   ├── api-client.ts     Client-side fetch wrapper → always hits /api/proxy
│       │   │   └── server-api.ts     server-only: direct API fetch for Server Components/layouts
│       │   └── middleware.ts         Redirects unauthenticated page navigation to /login
│       ├── jest/                     css-modules-mock.js, setup.ts (jest-dom) — see docs/DESIGN_SYSTEM.md
│       ├── package.json / tsconfig.json / next.config.js / .eslintrc.json / jest.config.js
│
├── packages/
│   ├── shared-types/                 Types/constants shared between api and web
│   │   └── src/index.ts              ROLE_NAMES, ORG_WIDE_ROLES, BrandSummary
│   └── ui/                           Design system (Sprint 3A, see docs/DESIGN_SYSTEM.md)
│       ├── src/
│       │   ├── tokens.css            Colors/spacing/radii/shadows/typography as CSS custom properties
│       │   ├── components/           One folder per component: Name.tsx + Name.module.css + Name.spec.tsx
│       │   ├── types/                css-modules.d.ts, jest-dom.d.ts (ambient declarations)
│       │   └── index.ts              Public entry point — the only import path consumers should use
│       ├── jest/                     css-modules-mock.js, setup.ts (jest-dom)
│       ├── package.json / tsconfig.json / jest.config.js / .eslintrc.js
│
├── docker/
│   └── docker-compose.yml            Local Postgres 16 + Redis 7
│
├── .github/workflows/
│   └── ci.yml                        Lint/test/build per workspace; api job runs against real Postgres
│
├── docs/
│   ├── ARCHITECTURE.md               System design: tenancy, RBAC, auth flow, tech stack, content workflow
│   ├── DESIGN_SYSTEM.md              packages/ui token/component inventory + consumption details
│   ├── FOLDER_STRUCTURE.md           This file
│   ├── SPRINT_1.md / SPRINT_2.md / SPRINT_3A.md / SPRINT_3B.md   Per-sprint scope, endpoints, review findings
│   └── adr/                          Architecture Decision Records (0001-0010 + template)
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
  match this shape rather than inventing a new one. A workflow-bearing
  feature (e.g. `content-requests/`) additionally gets a
  `<feature>-workflow.ts` transition table + assertion function, living in
  the feature module rather than a generic engine — see
  [ADR 0010](adr/0010-content-request-workflow-skeleton.md).
- **`apps/api/src/common/`** is for guards/decorators/filters/interceptors/
  services used by *more than one* module (e.g. `AuditLogService`,
  `OrgAccessService`, added in Sprint 2 after the same logic showed up in
  three different services). Feature-specific logic does not belong here
  even if it feels reusable in theory — move it here only once a second
  module actually needs it.
- **Tests live next to what they test** (`*.spec.ts`/`*.spec.tsx` beside the
  source file) for unit tests; **e2e tests live in `apps/api/test/`** since
  they exercise the whole app, not one file. Every RBAC guard combination
  actually used on a route (brand-scoped with `@Roles`, brand-scoped
  without, org-wide) has at least one e2e test proving it's wired to a real
  route, not just unit-tested in isolation.
- **Admin-only frontend routes live under `(dashboard)/admin/`**, gated by
  `admin/layout.tsx` (a Server Component checking `/auth/me`'s `orgRole`) —
  this is a UX convenience, not the security boundary; the API's
  `OrgRoleGuard` is the real enforcement point regardless of what the UI hides.
  Routes meant for every authenticated user (e.g. `content-requests/`) live
  directly under `(dashboard)/`, not `admin/`.
- **`packages/ui`** is the only place generic, reusable UI lives — styled
  with CSS Modules reading from `tokens.css` (see
  [ADR 0009](adr/0009-design-system-css-modules.md)). App-specific
  structural composition (`apps/web/src/components/shell/`) is built *on
  top of* `packages/ui`, not inside it — it doesn't move into the package
  unless a second consuming app needs it.
- **`docs/adr/`** holds decisions, **`docs/SPRINT_N.md`** holds
  per-sprint scope/history — don't mix the two (an ADR shouldn't read like a
  changelog entry, and a sprint doc shouldn't need to justify a decision from
  scratch — it should link to the relevant ADR instead).
