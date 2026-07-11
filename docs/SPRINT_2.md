# Sprint 2 — User, Role, Permission, Organization, Brand Management + Admin Dashboard

Status: **complete** — tagged `v0.2.0-sprint2`. All unit + e2e tests pass;
`apps/api` and `apps/web` both build and lint clean under strict TypeScript.

## Scope delivered

- **Shared services** (`apps/api/src/common/`): `AuditLogService` (single
  place every module writes audit entries — Sprint 1's `BrandsService` had
  this inline, now centralized and reused everywhere) and `OrgAccessService`
  (single place "does this user hold an org-wide role" is answered — used by
  `OrgRoleGuard` and by `/auth/me`'s new `orgRole` field, so the guard and
  the UI's admin-nav visibility check can never drift apart).
- **Users module**: pre-provision users ahead of first SSO login, update
  name, activate/suspend, list/grant/revoke their `BrandAccess` grants —
  this is the admin-side "Brand Switching" management the SRS asked for
  (Sprint 1 delivered the switching *mechanic*; Sprint 2 delivers who's
  allowed to switch into what).
- **Roles module extended**: full CRUD for **custom** roles (built-in roles
  remain immutable via API), with a permission-assignment flow
  (`permissionActions: string[]` on create/update does a full replace of
  the role's `RolePermission` set). Protected: built-in roles can't be
  edited/deleted; a role still assigned to users can't be deleted; a role
  belonging to another organization is invisible (404, not 403).
- **Permissions module** (new): list/create flat `resource:action` strings
  roles can reference.
- **Organizations module extended**: `PATCH /organizations/me` (Super Admin only).
- **Brands module extended**: `GET /brands` (admin listing of every brand,
  vs Sprint 1's access-filtered `GET /brands/mine`) and `PATCH /brands/:id`
  (Super Admin can edit any brand, distinct from the existing brand-scoped
  self-service `PATCH /brands/mine`).
- **Admin Dashboard** (frontend, `apps/web/src/app/(dashboard)/admin/`):
  server-side gated (redirects non-admins) overview + Users/Roles/
  Permissions/Brands/Organization screens. The main dashboard nav shows an
  "Admin" link only to users whose `/auth/me` reports an org-wide role.
- **Database**: `Role.organizationId` added (nullable — see ADR 0008),
  migration `20260711131402_role_organization_scoping`.

### Endpoints added

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET/POST | `/users`, PATCH `/users/:id`, PATCH `/users/:id/status` | `OrgRoleGuard` | Reads: Super Admin + Marketing Head. Writes: Super Admin only. |
| GET/POST `/users/:id/brand-access`, DELETE `/users/:id/brand-access/:id` | `OrgRoleGuard` | Grant/revoke — Super Admin only |
| GET/POST/PATCH/DELETE `/roles`, `/roles/:id` | `OrgRoleGuard` | Custom roles only for writes; built-in roles 403 on mutation |
| GET/POST `/permissions` | `OrgRoleGuard` | |
| PATCH `/organizations/me` | `OrgRoleGuard(SUPER_ADMIN)` | |
| GET `/brands`, PATCH `/brands/:id` | `OrgRoleGuard` | Admin-side, distinct from brand-scoped `/brands/mine` |

## Review findings from this sprint (fixed, not just noted)

Same checklist as Sprint 1 (security/performance/TS/NestJS/Next.js/DB/
error-handling/logging/validation/scalability/maintainability), run before
sign-off:

1. **Real gap — custom roles weren't organization-scoped.** `Role` had no
   `organizationId` in the Sprint 1 schema. Once Sprint 2 added
   `POST /roles`, this meant a future second organization's custom roles
   would be globally visible/assignable/editable by every other
   organization — directly contradicting ADR 0001's stated reason for the
   Organization → Brand hierarchy. Caught while reviewing `UsersService
   .grantBrandAccess`'s role lookup, which had no organization check.
   **Fix**: added nullable `Role.organizationId` (see ADR 0008), a new
   migration, and organization-scoping checks in `RolesService` (`findAll`,
   `findById`, `mustBeCustom`) and `UsersService.grantBrandAccess`. Added
   tests proving cross-organization access is rejected with 404 (not 403,
   to avoid confirming existence).
2. **`OrgRoleGuard` had no unit test** in Sprint 1 despite gating every
   admin-only endpoint since Sprint 1's `POST /brands`. **Fix**: added
   `org-role.guard.spec.ts` (5 cases) and `test/users.e2e-spec.ts` proving
   the guard is actually wired to a real route end-to-end (same rationale
   as Sprint 1's `brands.e2e-spec.ts`).
3. **Duplicated audit-log/org-role-lookup logic.** Sprint 1's
   `BrandsService` wrote audit entries inline; Sprint 2 needed the same
   pattern in 5 more services. **Fix**: extracted `AuditLogService` and
   `OrgAccessService` into a `@Global` `CommonModule`, and refactored
   `BrandsService`/`OrgRoleGuard` to use them instead of duplicating the
   Prisma calls.
4. **Migration generated without a live database.** Same offline
   `prisma migrate diff --from-schema-datamodel <old> --to-schema-datamodel
   <new> --script` approach as Sprint 1 (no Postgres available in this
   environment) — diffed against the previously committed schema via
   `git show HEAD:...` rather than guessing the SQL by hand.

## Known limitations / explicitly deferred (not bugs)

- Role name uniqueness is global, not per-organization (see ADR 0008) —
  acceptable with one organization today.
- No pagination on `/roles`, `/permissions`, or `GET /brands` — acceptable
  at current scale (14+N custom roles, tens of permissions, 4+N brands);
  revisit if any of these lists grows into the hundreds.
- Admin UI pages are functional, not visually polished (plain HTML
  tables/forms, consistent with Sprint 1's dashboard) — matches the
  project's current design priority (correctness/architecture over visual
  design at this stage).
- Server Component layouts (`admin/layout.tsx`, the main dashboard layout's
  admin-nav check) are not unit-tested — Next.js App Router Server
  Components aren't easily unit-testable with the current Jest+RTL setup
  without additional tooling. Covered instead by the underlying API's
  `OrgRoleGuard`/`OrgAccessService` tests, which are the actual security
  boundary; the layout check is UX-only (documented in both layout files).

## Running this sprint's tests

```bash
npm run test --workspace=apps/api       # 6 suites / 35 tests
npm run test:e2e --workspace=apps/api   # 3 suites / 12 tests
npm run test --workspace=apps/web       # 1 suite / 2 tests
```
