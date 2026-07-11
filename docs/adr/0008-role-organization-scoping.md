# ADR 0008: Custom roles are organization-scoped; built-in roles are global

**Status:** Accepted
**Date:** 2026-07-11

## Context

Sprint 2 added `POST /roles` (custom role creation). The `Role` model as it
shipped in Sprint 1 had no `organizationId` — every role was globally
visible and assignable. That was harmless with exactly one organization,
but it directly contradicted ADR 0001's rationale for the Organization →
Brand hierarchy: a second organization's Super Admin would have been able
to see, assign, edit, and delete the first organization's custom roles.
This was caught during Sprint 2's review pass (see docs/SPRINT_2.md), not
requested up front — worth fixing immediately since the cost of retrofitting
it later (after real custom roles exist in production) is much higher.

## Decision

`Role.organizationId` is nullable:
- `null` → a global/system role. The 14 seeded built-in roles (Super Admin,
  Brand Manager, Content Writer, ...) are global and visible to every
  organization.
- set → a custom role, scoped to exactly the creating organization. Never
  visible, assignable, editable, or deletable by another organization
  (`RolesService.findById`/`mustBeCustom` enforce this; unauthorized reads
  return 404, not 403, so existence itself isn't observable cross-tenant).

`Role.name` remains globally unique (not per-organization) for simplicity —
see the trade-off below.

## Consequences

- `UsersService.grantBrandAccess` also checks role visibility before
  granting, not just `BrandsService`/`RolesService` — any code path that
  looks up a role by id needs this same check, which is easy to forget when
  adding a new one later. (Searching for `role.organizationId` should turn
  up every enforcement point if this needs auditing again.)
- Global role name uniqueness means two organizations cannot both have a
  custom role literally named `REGIONAL_LEAD` — a minor UX limitation, not a
  security one. Acceptable while there's one organization; revisit
  (per-organization uniqueness via a composite key) if/when a second
  organization actually onboards, since Postgres treats `NULL` values as
  distinct in unique indexes, which changes how that migration needs to be
  designed.
