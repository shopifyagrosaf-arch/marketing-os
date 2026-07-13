# UI Preview — mock-data frontend for internal sign-off

Status: **complete**, tagged `v0.3.0-ui-preview`. `apps/web` builds and lints
clean under strict TypeScript; all pre-existing unit tests still pass.

## Why this exists

Sprints 1–3 built a multi-tenant, RBAC-backed NestJS/Postgres platform aimed
at a 500+ user / 50+ brand SaaS ambition (see `docs/adr/0001` through `0008`
and `ROADMAP.md`). Mid-Sprint-4 planning, the direction changed: the
immediate need is a clickable internal tool for one company's marketing team,
usable **today**, with real backend integration deferred until the UI itself
is reviewed and approved. See [ADR 0011](adr/0011-ui-preview-mock-data-pivot.md)
for the full rationale and what happens to the paused backend.

This build is **frontend-only, mock data, no persistence**. Every module is
fully interactive (create/edit/delete, drag-and-drop, filters, search) against
an in-memory store backed by `localStorage`, so state survives a refresh but
is not shared across devices/users and is not a real database.

## Modules delivered

1. **Login** — mock sign-in: pick a seeded user, no password/SSO. Sets a
   `mock_user_id` cookie `middleware.ts` gates navigation on.
2. **Dashboard** — stat tiles, a requests-by-status bar chart and a 14-day
   reach line chart (Recharts, palette/marks per the dataviz skill), recent
   activity feed.
3. **Sidebar navigation** — collapsible on mobile, active-route highlighting,
   user menu with theme toggle and sign-out.
4. **Content Request** — list with search/status filter, create modal, detail
   page with edit-in-place and status transitions (Draft → Submitted → In
   Review → Approved/Rejected → Published).
5. **Task Board** — Kanban (To Do/In Progress/Review/Done) with native
   HTML5 drag-and-drop between columns, linked to a content request.
6. **Content Calendar** — month grid, content requests plotted by due date,
   prev/next navigation.
7. **Asset Library** — grid of mock assets, real file picker (captures
   name/size/type; no actual upload/storage), search + type filter.
8. **Approval** — queue of Submitted/In Review requests, approve/reject with
   a comment, decision history.
9. **Performance Dashboard** — manual metric entry (reach/likes/comments/
   shares/clicks), totals, engagement-by-platform bar chart, entries table.
10. **User Management** — invite/edit/remove users, inline role change.
11. **Settings** — profile edit, workspace name, light/dark theme toggle.

## Architecture decisions specific to this build

- **Tailwind CSS**, not the CSS-Modules design system from Sprint 3A
  (`packages/ui`) — see ADR 0011. `packages/ui` is untouched and still
  builds/lints/tests on its own; nothing consumes it in this build.
- **Mock data layer** (`apps/web/src/mock/`): `types.ts` (entity shapes),
  `seed.ts` (deterministic seed data), `store.tsx` (a React Context —
  `MockDataProvider`/`useMockStore` — holding all CRUD state, persisted to
  `localStorage`, plus the mock session and theme).
- **No multi-tenancy, no RBAC, no org/brand hierarchy** in this build's data
  model — a flat `Role` string on `MockUser` (Admin/Marketing Head/Brand
  Manager/Content Writer/Viewer) drives nothing but the Users page today (no
  permission enforcement, since there is no backend to enforce it against).
- **Charts**: Recharts, colors/marks/status palette from the dataviz skill's
  reference instance (`references/palette.md`) — fixed categorical order for
  content-request status (never re-colored by rank), single-hue sequential
  for the reach trend, one axis per chart.

## What's dormant, not deleted

The Sprint 1–3 backend (`apps/api` — NestJS, Postgres/Prisma, RBAC,
Organization→Brand hierarchy, audit log, Content Request workflow engine),
Docker Compose, CI (`.github/workflows/ci.yml`), and `apps/web`'s old
Auth.js/brand-switcher/admin-dashboard code are **untouched, just
unreferenced** by this build. Nothing was deleted; all of it remains
buildable and tested independently (`apps/api`'s own build/lint/test suite
still passes). See ADR 0011 for what it would take to resume that path.

## Known limitations (by design, not bugs)

- No persistence beyond the current browser's `localStorage` — clearing site
  data or switching browsers resets to the seed dataset.
- No real authentication, authorization, or multi-user concurrency — this is
  a single-browser mock, not a shared backend.
- Asset "upload" only captures file metadata (name/size/type) for the demo
  card; no bytes are stored anywhere.
- No automated test coverage was added for the new pages (time-boxed to ship
  the same day) — existing suites (`packages/ui`, `apps/api`, and the
  untouched `apps/web` shell/brand-switcher components) all still pass.

## Running this build

```bash
npm run dev --workspace=apps/web       # http://localhost:3000
npm run build --workspace=apps/web
npm run lint --workspace=apps/web
npm run test --workspace=apps/web      # pre-existing suites only
```
