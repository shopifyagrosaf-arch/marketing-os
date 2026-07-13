# UI Preview — mock-data frontend for internal sign-off

Status: **complete**, tagged `v0.3.0-ui-preview`. `apps/web` builds and lints
clean under strict TypeScript; all pre-existing unit tests still pass;
every route smoke-tested against a running dev server.

## Why this exists

Sprints 1–3 built a multi-tenant, RBAC-backed NestJS/Postgres platform aimed
at a 500+ user / 50+ brand SaaS ambition (see `docs/adr/0001` through `0008`
and `ROADMAP.md`). Mid-Sprint-4 planning, the direction changed: the
immediate need is a clickable internal tool for one company's marketing team,
usable **today**, with real backend integration deferred until the UI itself
is reviewed and approved. See [ADR 0011](adr/0011-ui-preview-mock-data-pivot.md)
for the full rationale and what happens to the paused backend.

This build is **frontend-only, mock data, no persistence**. Every module is
fully interactive (create/edit/delete, drag-and-drop, filters, search,
pagination) against an in-memory store backed by `localStorage`, so state
survives a refresh but is not shared across devices/users and is not a real
database.

## Modules delivered (10 pages + navigation)

1. **Login** — mock sign-in: pick one of the real team's 9 seeded users
   (Aman Shakya/Manager, Kushagra Agarwal/Management, Rittika Agarwal/
   Marketing Executive, Shraddha Sharma & Shiva Sharma/Graphic Designer,
   Sarthak Shakya/Video Editor, Muskan Shakya/Social Media Executive, Sujay
   Sharma/Performance Marketing Executive, Mansi Jethi/Content Writer), no
   password/SSO. Sets a `mock_user_id` cookie `middleware.ts` gates
   navigation on, then routes to that role's home page (see
   `lib/permissions.ts`) — everyone does **not** land on the same screen.
2. **Dashboard** — clickable stat tiles (link to the relevant page), a
   requests-by-status bar chart and a gradient-filled reach area chart
   (Recharts, palette/marks per the dataviz skill), recent activity feed
   linking to each request.
3. **Sidebar navigation** — collapsible on mobile, active-route
   highlighting, user menu with theme toggle and sign-out, animated
   route transitions.
4. **Content Request** — search/status/brand filters, paginated table,
   create modal, delete with confirm dialog, detail page with edit-in-place
   and status transitions (Draft → Submitted → In Review →
   Approved/Rejected → Published), toasts on every mutation.
5. **Task Board** — Kanban (To Do/In Progress/Review/Done) with native
   HTML5 drag-and-drop, assignee/priority filters, click a card to open an
   edit drawer, remove with confirm dialog.
6. **Content Calendar** — month grid, content requests plotted by due date,
   a "+N more" link opens a modal with the full day's items, horizontally
   scrollable on narrow screens.
7. **Asset Library** — upload modal (dropzone-style picker + optional
   content-request link), paginated grid, search + type filter, click a
   card to open a preview drawer (metadata, mock download, delete with
   confirm).
8. **Approval** — queue of Submitted/In Review requests, approve/reject
   gated behind a confirm dialog, decision history, toasts.
9. **Performance Dashboard** — manual metric entry, stat tiles, an
   engagement-by-platform bar chart, a searchable/filterable/paginated
   entries table.
10. **User Management** — search + role filter, paginated table, invite
    modal, click a row to open a detail drawer (role, request count),
    remove with confirm dialog.
11. **Brands** — search + status filter, paginated card grid, create modal
    with a color picker, detail drawer with inline edit, delete with
    confirm dialog (warns if requests are linked). New this pass — every
    Content Request now carries a `brandId` and is filterable/labeled by
    brand throughout.
12. **Settings** — profile edit, workspace name, light/dark theme toggle,
    a danger-zone account deletion gated behind a confirm dialog.

## Production-quality pass (this round)

- **Toasts** (`components/ui/toast.tsx`): a `ToastProvider`/`useToast()`
  context, animated in/out with framer-motion, auto-dismissing — every
  create/update/delete across every page confirms itself.
- **Confirmation dialogs** (`components/ui/ConfirmDialog.tsx`): an
  imperative `useConfirm()` hook (`await confirm({...})`) backing every
  destructive action (delete request/task/asset/user/brand, reject an
  approval, delete account) — nothing destructive happens without one.
- **Drawers** (`components/ui/Drawer.tsx`): slide-in side panels for
  task/asset/user/brand detail-and-edit, animated with framer-motion.
- **Pagination** (`components/ui/Pagination.tsx`): every table (Content
  Requests, Performance entries, Users) and the Asset/Brand grids page at
  a fixed size instead of rendering everything at once.
- **Loading states**: `useSimulatedLoading()` fakes a brief fetch delay
  (the mock store resolves synchronously otherwise) so skeleton
  states (`components/ui/Skeleton.tsx` — table/card/stat-row variants) are
  real, reviewable UI on every data page.
- **Empty states**: every filterable list has a real `EmptyState` with a
  contextual action, not just a blank table.
- **Dark/light mode**: unchanged mechanism (class-based, persisted,
  `prefers-color-scheme` default) but every new component (toasts,
  dialogs, drawers, brand cards) is dark-mode-aware.
- **Animation**: framer-motion powers modal/drawer/toast/dialog
  enter-exit transitions and a fade-in on route change
  (`components/shell/AppShell.tsx`); buttons get a subtle press-scale.
  Global 150ms color/background transitions smooth the dark-mode toggle.
- **Typography**: Inter (`next/font/google`) replaces the system font
  stack for a more premium feel; numeric columns use `tabular-nums`.
- **Charts**: the dashboard's reach chart is now a gradient area chart
  with a formatted tooltip; all charts keep the dataviz skill's rules
  (one axis, fixed categorical order, status-reserved colors).

## Real team + role-based access (this pass)

The 9 demo users were replaced with the actual team (see `mock/seed.ts`).
Avatar initials are derived automatically from each name (`Avatar.tsx`
already split-and-slice'd on name — no per-user initials were hand-set).

`lib/permissions.ts` defines, per role: `ROLE_ROUTES` (which pages a role
may reach) and `ROLE_HOME` (which page they land on right after login):

| Role | Home page | Reachable pages |
|---|---|---|
| Manager, Management | Dashboard | Everything, including User Management and Brands |
| Marketing Executive | Content Requests | Dashboard, Content Requests, Tasks, Calendar, Performance, Settings |
| Graphic Designer (×2), Video Editor | Asset Library | Dashboard, Tasks, Assets, Settings |
| Social Media Executive | Content Calendar | Dashboard, Content Requests, Tasks, Calendar, Assets, Settings |
| Performance Marketing Executive | Performance | Dashboard, Content Requests, Performance, Settings |
| Content Writer | Content Requests | Dashboard, Content Requests, Tasks, Settings |

This is enforced twice, not just visually: `Sidebar.tsx` hides links a role
can't reach, and `AppShell.tsx` redirects to the role's home page if it
detects the current URL isn't in that role's `ROLE_ROUTES` (e.g. typing
`/users` in directly as a Content Writer bounces to `/content-requests`).
Approvals and User/Brand management stay Manager/Management-only, matching
who actually approves content and manages the team today.

This is still a **UI-layer permission model** — there is no backend to
enforce it against, so it governs navigation/rendering only, the same
caveat as every other mock-data behavior in this build.

## Architecture decisions specific to this build

- **Tailwind CSS**, not the CSS-Modules design system from Sprint 3A
  (`packages/ui`) — see ADR 0011. `packages/ui` is untouched and still
  builds/lints/tests on its own; nothing consumes it in this build.
- **Mock data layer** (`apps/web/src/mock/`): `types.ts` (entity shapes,
  now including `Brand`), `seed.ts` (deterministic seed data, `SEED_BRANDS`
  = the four Agrosaf brands), `store.tsx` (a React Context —
  `MockDataProvider`/`useMockStore` — holding all CRUD state, persisted to
  `localStorage` under a versioned key, plus the mock session and theme).
- **No multi-tenancy, no RBAC enforcement** in this build's data model — a
  flat `Role` string on `MockUser` and a `Brand` entity organize the UI, but
  neither is permission-enforced (no backend to enforce it against). Brands
  are a management/labeling concept here, not a tenancy boundary.
- **Charts**: Recharts, colors/marks/status palette from the dataviz
  skill's reference instance (`references/palette.md`) — fixed categorical
  order for content-request status (never re-colored by rank), single-hue
  sequential for the reach trend, one axis per chart.

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
  data or switching browsers resets to the seed dataset. The storage key was
  bumped to `v2` this pass (schema gained `Brand`/`brandId`); anyone who ran
  the previous build will silently reseed once, by design.
- No real authentication, authorization, or multi-user concurrency — this is
  a single-browser mock, not a shared backend.
- Asset "upload" only captures file metadata (name/size/type) for the demo
  card; no bytes are stored anywhere. "Download" in the asset drawer shows a
  toast explaining this rather than silently doing nothing.
- No automated test coverage was added for the new pages (time-boxed) —
  existing suites (`packages/ui`, `apps/api`, and the untouched `apps/web`
  shell/brand-switcher components) all still pass; the new pages were
  verified via `next build`'s type-check plus a manual smoke test against a
  running dev server (every route returns 200, no server-side errors).

## Running this build

```bash
npm run dev --workspace=apps/web       # http://localhost:3000
npm run build --workspace=apps/web
npm run lint --workspace=apps/web
npm run test --workspace=apps/web      # pre-existing suites only
```
