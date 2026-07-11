# Sprint 1 — Auth/SSO, Org/Brand Schema, RBAC Foundation, Brand Switcher Shell

Status: **complete**. All unit + e2e tests pass; `apps/api` and `apps/web`
both build and lint clean under strict TypeScript.

## Scope delivered

- **Database** (`apps/api/prisma/schema.prisma`): `Organization`, `Brand`,
  `User`, `Role`, `Permission`, `RolePermission`, `BrandAccess`, `AuditLog`.
  Seed script (`apps/api/prisma/seed.ts`) provisions Agrosaf Group, its 4
  brands, all 14 roles, and one Super Admin (email supplied via
  `SEED_SUPER_ADMIN_EMAIL` — never hardcoded).
- **Auth**: Auth.js SSO (Google Workspace / Microsoft 365) in `apps/web`;
  NestJS `passport-jwt` strategy verifies a short-lived token minted
  server-side per request (see `docs/ARCHITECTURE.md` for why these are two
  different tokens). First login auto-provisions a `User` row under the
  single existing `Organization`.
- **RBAC**: `BrandAccessGuard` (resolves `x-brand-id` → role), `RolesGuard`
  (`@Roles(...)`, brand-scoped), `OrgRoleGuard` (`@OrgRoles(...)`,
  org-wide-only actions). All three are unit-tested in isolation
  (`src/common/guards/*.spec.ts`) **and** exercised together end-to-end via
  `test/brands.e2e-spec.ts` against a real route (`PATCH /brands/mine`).
- **Endpoints**:

  | Method | Path | Guard | Notes |
  |---|---|---|---|
  | GET | `/health` | `@Public()` | Liveness check |
  | GET | `/auth/me` | JWT only | Current user |
  | GET | `/organizations/me` | JWT only | Current org |
  | GET | `/brands/mine` | JWT only | Powers the brand switcher |
  | GET | `/brands/:id` | JWT + service-level check | Single brand detail |
  | PATCH | `/brands/mine` | `BrandAccessGuard` + `RolesGuard(BRAND_MANAGER, MARKETING_HEAD, SUPER_ADMIN)` | Reference implementation of the full brand-scoped RBAC chain |
  | POST | `/brands` | `OrgRoleGuard(SUPER_ADMIN)` | Create a brand |
  | GET | `/roles` | `OrgRoleGuard(SUPER_ADMIN, MARKETING_HEAD)` | Read-only in Sprint 1 |

- **Frontend shell**: `/login` (SSO buttons, no local credentials), a
  `(dashboard)` route group with a brand switcher (`BrandProvider` +
  `BrandSwitcher`) that persists the selection to `localStorage` and sends it
  as `x-brand-id` on every API call — this is the actual "switch brands
  without logging out" implementation.
- **Cross-cutting**: global exception filter (consistent error shape, logs
  5xx with stack), request-logging interceptor (method/path/duration/user/
  brand), Helmet, CORS, per-IP rate limiting (`@nestjs/throttler`), strict
  env validation at boot (fails fast if `AUTH_SECRET`/`DATABASE_URL` missing
  or `AUTH_SECRET` too short), full TypeScript `strict` mode, ESLint +
  Prettier on both apps, CI workflow (lint/test/build, `apps/api` against a
  real Postgres service container).

## Review findings from this sprint (fixed, not just noted)

A full review pass (security/performance/TS/NestJS/Next.js/DB/error-handling/
logging/validation/scalability/maintainability) was run against this sprint
before sign-off. Findings, all fixed:

1. **Real bug — env validation race in e2e tests.** `ConfigModule.forRoot()`
   reads and validates `process.env` at *import time* of `app.module.ts`, not
   at `TestingModule.compile()` time. Spec files that set `process.env.*` in
   their own top-level code (after the `import { AppModule }` line) were too
   late — the API was silently validating JWTs against the wrong
   `AUTH_SECRET` in every authenticated e2e test. Caught because the
   BRAND_MANAGER-success test failed with an unexpected 401 instead of 200.
   **Fix**: moved required env vars into `test/jest-e2e.setup.ts`, wired via
   Jest's `setupFiles` (guaranteed to run before any test file is even
   imported). See the comment at the top of `test/app.e2e-spec.ts`.
2. **Dead guard chain.** `BrandAccessGuard`/`RolesGuard`/`CurrentBrand` had
   unit tests but were never wired to a real route — the RBAC "foundation"
   wasn't actually provable end-to-end. **Fix**: added `PATCH /brands/mine`
   as the reference implementation, plus `test/brands.e2e-spec.ts` covering
   allow/deny/missing-header/unauthenticated cases.
3. **Unused dependency.** `@nestjs/jwt` was declared but never imported
   anywhere (JWT verification goes through `passport-jwt` directly).
   Removed.
4. **`any`-typed request access.** Guards/decorators/interceptor read
   `request.user` / `request.brandContext` off an untyped `getRequest()`.
   **Fix**: `src/types/express.d.ts` augments `Express.User` (the interface
   `@types/passport` already provides for exactly this) and adds
   `brandContext` to `Express.Request`, removing the `any` casts.
5. **TypeScript not fully strict.** Default Nest scaffold tsconfig only sets
   `strictNullChecks`. **Fix**: enabled full `strict`, plus
   `noUnusedLocals`/`noUnusedParameters`/`noImplicitReturns`; build stayed
   clean with no code changes required.
6. **No linting configured** for either app despite being asked for as a
   review criterion. **Fix**: ESLint + Prettier (api), `eslint-config-next`
   (web); both lint clean.
7. **Unhandled promise rejection in `main.ts`** (`bootstrap()` called without
   `.catch`) and **missing security headers/rate limiting**. **Fixed**:
   `.catch()` added; Helmet + `@nestjs/throttler` wired globally.
8. **Missing Next.js error/loading boundaries** for the dashboard route.
   Added `(dashboard)/error.tsx` and `(dashboard)/loading.tsx`.

## Known limitations / explicitly deferred (not bugs)

- `/roles` is read-only; custom-role CRUD is Sprint 2 (Admin Console) scope
  per the roadmap — do not add write endpoints ahead of that sprint.
- No content/campaign/workflow data model yet (Sprint 3+).
- `BrandAccessGuard` issues up to 2 sequential Prisma queries per request;
  acceptable at the 35–50-user MVP scale approved in the SRS, worth
  revisiting only if profiling shows it matters at future scale.
- Redis/BullMQ are provisioned in `docker-compose.yml` but not yet consumed
  by any queue — first real usage will be async AI generation in a later
  sprint.

## Running this sprint's tests

```bash
npm run test --workspace=apps/api       # 3 suites / 12 tests
npm run test:e2e --workspace=apps/api   # 2 suites / 7 tests
npm run test --workspace=apps/web       # 1 suite / 2 tests
```
