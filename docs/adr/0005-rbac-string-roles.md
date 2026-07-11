# ADR 0005: RBAC as string role + BrandAccess join, not a fixed enum

**Status:** Accepted
**Date:** 2026-07-11

## Context

The SRS explicitly requires that Super Admin be able to create custom roles
and permissions "without changing the software." 14 roles were identified
during discovery, but the org was clear this list will grow. A hardcoded
TypeScript enum or a Prisma `enum` for role names would mean every new role
requires a code change and a migration.

## Decision

`Role` is a database row (`id`, `name`, `isCustom`, `isOrgWide`), not a fixed
enum — `name` is compared as a plain string in guards (`@Roles('BRAND_MANAGER')`).
`Permission` is similarly a flat, freeform `action` string
(e.g. `content:approve`), joined to roles via `RolePermission`. `BrandAccess`
joins `User` × `Brand` × `Role`, which is also what implements per-brand,
per-user role assignment and brand switching (see ADR 0003).

## Consequences

- No compile-time exhaustiveness checking on role names — a typo in
  `@Roles('BRAN_MANAGER')` fails at request-time (403), not at build-time.
  Mitigated by seeding role names from one source
  (`packages/shared-types`'s `ROLE_NAMES`) rather than hand-typing them in
  multiple places, and end-to-end tests exercising the real routes.
- `Permission`/`RolePermission` exist in the schema but Sprint 1 only checks
  role *names* directly (`@Roles`), not fine-grained permissions — the
  permission-checking layer is Sprint 2 scope (Admin Console / custom roles).
  This ADR's decision (string-based, not enum-based) is what makes that
  addition non-breaking when it lands.
