# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project's internal releases are tagged (not yet semantically
versioned against an external consumer, since this is an internal system).

## [v0.3.0-ui-preview] — UI Preview (mock data)

Pivot from the multi-tenant SaaS backend build to a same-day, mock-data-only
internal tool covering 11 modules — see
[ADR 0011](docs/adr/0011-ui-preview-mock-data-pivot.md) and
[`docs/SPRINT_UI_PREVIEW.md`](docs/SPRINT_UI_PREVIEW.md). The Sprint 1–3
backend and design system (`v0.3.0-sprint3`) are paused, not deleted.

### Added
- `apps/web` rebuilt on Tailwind CSS with dark/light mode: Login (mock
  session), Dashboard (charts via Recharts, dataviz-skill palette), Content
  Requests (list/create/edit/transitions), Task Board (Kanban with
  drag-and-drop), Content Calendar (month grid), Asset Library, Approvals,
  Performance Dashboard (manual entry + charts), User Management, Brands,
  Settings — 12 pages total, see `docs/SPRINT_UI_PREVIEW.md`.
- `apps/web/src/mock/` — in-memory + `localStorage`-persisted data layer
  (`MockDataProvider`/`useMockStore`) replacing all backend calls in this
  build, including a `Brand` entity every Content Request now references.
- `apps/web/src/components/ui/` — a Tailwind-based primitive set (Button,
  Card, Badge, Input/Select/Textarea, Table, Modal, Drawer, ConfirmDialog,
  Toast, Pagination, Skeleton, Avatar, EmptyState, SearchInput, StatTile).
- Cookie-based mock session (`mock_user_id`) gating navigation in
  `middleware.ts`, replacing the Auth.js-backed check for this build.
- Production-quality pass: toast notifications and confirmation dialogs on
  every mutation, slide-in detail drawers, pagination on every table/grid,
  simulated loading + skeleton states, framer-motion animations (modals,
  drawers, toasts, route transitions), Inter typeface.

### Changed
- `apps/web/src/app/layout.tsx`, `(dashboard)/layout.tsx`,
  `(auth)/login/page.tsx`, `middleware.ts`, and the Content Requests pages
  now run on the mock data layer instead of the NestJS API.

### Dormant (not removed)
- `apps/api` (NestJS/Postgres backend), Docker Compose, CI
  (`.github/workflows/ci.yml`), Auth.js, the brand-switcher, and the old
  `/admin/*` dashboard remain in the repo, still independently
  build/lint/test clean, but are unreferenced by this build.

## [v0.3.0-sprint3] — Sprint 3A + 3B

Sprint 3 was split into 3A (Design System & Admin UI Foundation) and 3B
(Content Request Intake & Workflow Engine) at the user's request — see
`ROADMAP.md`'s "Notes on scope changes". Both are tagged together since 3B
was built directly on top of 3A in the same pass.

### Added — Sprint 3A (Design System & Admin UI Foundation)

- New workspace package `packages/ui`: design tokens (`tokens.css`) and 12
  components (`Button`, `FormField`/`TextInput`/`Textarea`/`Select`/
  `Checkbox`, `Table`, `Card`, `Container`, `Badge`, `Alert`, `Spinner`,
  `EmptyState`, `Pagination`), styled with CSS Modules
  (see `docs/adr/0009-design-system-css-modules.md`). 21 component tests.
- Admin UI Foundation (`apps/web/src/components/shell/`): `AppHeader`,
  `AdminSidebar`, `PageHeader` — replace Sprint 1/2's inline-styled
  header/nav/`<h1>`.
- Every existing page (`(dashboard)`/`admin` layouts, all six `/admin/*`
  pages, dashboard placeholder, `loading`/`error`, `/login`,
  `BrandSwitcher`) refactored onto the design system, same behavior/endpoints.
- Users list now renders real pagination (`Pagination`, wired to the
  `{ items, total, page, limit }` shape `GET /users` already returned) and
  an `EmptyState` for no-results searches.
- `docs/DESIGN_SYSTEM.md` (token/component reference) and
  `docs/SPRINT_3A.md`.

### Added — Sprint 3B (Content Request Intake & Workflow Engine)

- `ContentRequest` model (brand-scoped, attributed to its requester) with a
  `ContentRequestStatus` enum (`DRAFT`/`SUBMITTED`/`CANCELLED`) and a
  workflow engine skeleton — `CONTENT_REQUEST_TRANSITIONS` lookup table +
  `assertValidContentRequestTransition`, the single enforcement point for
  legal status changes (see `docs/adr/0010-content-request-workflow-skeleton.md`).
  Migration `content_request_intake`.
- `GET/POST /content-requests`, `GET/PATCH /content-requests/:id`,
  `PATCH /content-requests/:id/status` — brand-scoped via `BrandAccessGuard`
  alone (no `@Roles`; intake is open to any role with brand access);
  edit/transition additionally requires being the requester or holding an
  org-wide role. Every mutation writes through `AuditLogService`.
- Frontend: `Content Requests` list (paginated, with a create form) and
  detail page (edit while `DRAFT`, Submit/Cancel/Withdraw transition
  actions) under `(dashboard)/content-requests/`, linked from `AppHeader`
  for every authenticated user (not admin-gated).
- `docs/SPRINT_3B.md`.

### Fixed (found during Sprint 3A review)

- The first version of the Jest CSS-Modules mock silently broke every
  `className` assertion: its unguarded `Proxy` answered TypeScript's
  `__importDefault` interop check (`mod.__esModule`) with the truthy string
  `'__esModule'`, causing the helper to return `styles.default` (literally
  the string `'default'`) instead of the module — every `styles.foo` lookup
  then silently evaluated to `undefined`. Caught because `Button.spec.tsx`/
  `Badge.spec.tsx` explicitly assert on `.className`. **Fix**: the mock's
  `get` trap now special-cases `__esModule` to return `false` (the standard
  `identity-obj-proxy` pattern).
- `apps/web`'s ts-jest transform didn't know about Next's `jsx: "preserve"`
  tsconfig setting (meant for Next's own SWC/Babel pipeline, not ts-jest),
  and Jest's default `transformIgnorePatterns` was skipping `@agrosaf/ui`'s
  raw `.tsx` source as a `node_modules` dependency. Both were latent since
  Sprint 1 (zero `.tsx` test files existed before this sprint) and surfaced
  once component tests were added. **Fix**: `apps/web/jest.config.js` now
  overrides `jsx: 'react-jsx'` for ts-jest and carves out
  `/node_modules/(?!@agrosaf)` from `transformIgnorePatterns`.

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
