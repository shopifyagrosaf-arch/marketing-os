# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project's internal releases are tagged (not yet semantically
versioned against an external consumer, since this is an internal system).

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
