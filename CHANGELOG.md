# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project's internal releases are tagged (not yet semantically
versioned against an external consumer, since this is an internal system).

## [v0.2.0-sprint2] — Sprint 2

### Added
- User management: pre-provision users ahead of first SSO login,
  activate/suspend, list/grant/revoke `BrandAccess` grants
  (`/users`, `/users/:id/brand-access`).
- Custom role CRUD with permission assignment (`/roles`) — built-in roles
  remain immutable via API; roles in use or belonging to another
  organization can't be deleted/edited.
- Permission management (`/permissions`).
- Organization settings update (`PATCH /organizations/me`).
- Brand admin listing/update (`GET /brands`, `PATCH /brands/:id`), distinct
  from the brand-scoped self-service `PATCH /brands/mine`.
- Admin Dashboard frontend (`/admin/*`): Users, Roles, Permissions, Brands,
  Organization screens, server-side gated to Super Admin/Marketing Head.
- Shared `AuditLogService` and `OrgAccessService` (`common/`), replacing
  Sprint 1's inline audit-log/org-role-lookup duplication.
- Migration `role_organization_scoping`: `Role.organizationId` (see
  `docs/adr/0008-role-organization-scoping.md`).

### Fixed (found during Sprint 2 review)
- Custom roles had no organization scoping — a future second organization
  would have been able to see/assign/edit/delete another organization's
  custom roles, contradicting ADR 0001. Fixed with `Role.organizationId`
  plus enforcement in `RolesService` and `UsersService.grantBrandAccess`.
- `OrgRoleGuard` had no unit test despite gating admin endpoints since
  Sprint 1 — added unit tests and an end-to-end test proving the guard
  chain is wired to a real route.

## [v0.1.0-foundation] — Sprint 1

### Added
- Monorepo foundation: `apps/api` (NestJS), `apps/web` (Next.js),
  `packages/shared-types`, Docker Compose (Postgres + Redis), GitHub Actions CI.
- Database schema and initial migration: `Organization` → `Brand` hierarchy,
  `User`, `Role`, `Permission`, `RolePermission`, `BrandAccess`, `AuditLog`.
- Seed script provisioning Agrosaf Group, its 4 brands, and all 14 roles.
- Authentication: Auth.js SSO (Google Workspace / Microsoft 365) in
  `apps/web`; NestJS `passport-jwt` verification of a short-lived
  server-minted token (see `docs/ARCHITECTURE.md`).
- RBAC foundation: `BrandAccessGuard`, `RolesGuard`, `OrgRoleGuard`, with
  `PATCH /brands/mine` as the reference brand-scoped endpoint.
- Brand switcher shell (frontend): switch brands without re-authenticating.
- Cross-cutting: global exception filter, request-logging interceptor,
  Helmet, per-IP rate limiting, strict env validation at boot, TypeScript
  strict mode, ESLint + Prettier on both apps.
- Documentation: `docs/ARCHITECTURE.md`, `docs/SPRINT_1.md`,
  `docs/FOLDER_STRUCTURE.md`, `docs/adr/`, `CONTRIBUTING.md`, this changelog,
  MIT `LICENSE`.

### Fixed (found during Sprint 1 review, before tagging)
- e2e tests were validating JWTs against the wrong `AUTH_SECRET` due to a
  `ConfigModule` env-read ordering issue — moved required env vars into a
  Jest `setupFiles` hook.
- RBAC guard chain was unit-tested but never wired to a live route — added
  `PATCH /brands/mine` plus an end-to-end test.
- Removed an unused `@nestjs/jwt` dependency.
- Replaced `any`-typed request access with proper `Express.Request`/
  `Express.User` type augmentation.
- Fixed an invalid `npx --workspace=` flag in the CI workflow (workspaces are
  an `npm` concept, not an `npx` one) — corrected to `npm exec --workspace=`.
