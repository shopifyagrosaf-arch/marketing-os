# ADR 0011: UI-preview pivot — mock-data frontend on Tailwind, backend paused (not deleted)

**Status:** Accepted
**Date:** 2026-07-13

## Context

Sprints 1–3 (see ADR 0001–0010) built toward a multi-tenant SaaS platform:
Organization→Brand hierarchy, string-role RBAC with `BrandAccess`, a NestJS/
Postgres backend, Docker Compose, CI, an audit log, and a Content Request
workflow engine — aimed at a confirmed 500+ user / 50+ brand long-term
ambition.

Mid-Sprint-4 planning (AI drafting + Content Editor), priorities changed
inside the same working session: the immediate need became a clickable
internal tool the marketing team could use the same day, covering 11
specific modules (Login, Dashboard, Content Request, Task Board, Content
Calendar, Asset Library, Approval, Performance, User Management, Settings,
Sidebar Navigation), explicitly deferring Supabase/a real backend/auth/CI/
Docker/Redis/AI integration until the UI itself is reviewed and approved.

Two implementation choices followed from that:

1. **Data layer**: wire a real backend (Supabase or the existing NestJS API)
   vs. an in-memory/`localStorage` mock store. A real backend was explicitly
   out of scope for today's deadline.
2. **Styling**: extend Sprint 3A's CSS-Modules design system (`packages/ui`,
   ADR 0009) vs. adopt Tailwind CSS. ADR 0009's reasoning (no styling
   runtime dependency, cloud-portability) still holds for a
   backend-integrated app, but Tailwind's utility classes and built-in
   `dark:` variant support let a modern, responsive, dark/light-mode UI
   across 11 screens ship in one session — the explicit priority this round.

## Decision

- Build a **frontend-only** `apps/web` update: a React Context
  (`MockDataProvider`/`useMockStore`, `src/mock/`) holds all entity state,
  seeded with realistic data, persisted to `localStorage`. No network calls
  to any backend.
- Style this build with **Tailwind CSS**, not `packages/ui`. `packages/ui`
  is left exactly as Sprint 3A delivered it — untouched, still independently
  built/linted/tested — but nothing in this build imports from it. This is a
  deliberate, scoped divergence from ADR 0009 for the mock-data phase, not a
  reversal of it.
- The Sprint 1–3 backend and its infrastructure (`apps/api`, Docker Compose,
  `.github/workflows/ci.yml`, Auth.js, the brand-switcher, the old admin
  dashboard) are **left in place, dormant** — not deleted. They still build,
  lint, and test cleanly on their own. Two Next.js route handlers
  (`api/auth/[...nextauth]`, `api/proxy/[...path]`) remain present and
  compile (Next.js includes every `route.ts` in the build graph regardless
  of whether pages link to it) but are unreferenced by the new pages.
- Mock login replaces Auth.js for this phase: pick a seeded user, set a
  `mock_user_id` cookie, gate navigation in `middleware.ts` on that cookie's
  presence. This is explicitly not a security boundary.

## Consequences

- **Nothing from Sprints 1–3 is lost.** `v0.3.0-sprint3` (tag) is the
  complete, working multi-tenant backend + design system at the point of
  the pivot. Resuming that path means: re-point `apps/web`'s data layer from
  `useMockStore` back to `apiFetch`/`serverApiFetch`, restore
  Auth.js-backed `middleware.ts`, and decide whether the new mock-data pages
  get re-skinned onto `packages/ui` or `packages/ui` gets retired in favor
  of Tailwind project-wide (a decision to make explicitly then, not implied
  by this ADR).
- **Two styling systems now coexist in the repo** (CSS Modules in
  `packages/ui`, Tailwind in this build) until that decision is made —
  acceptable short-term duplication given neither is deleted, but should not
  be left indefinitely once backend integration resumes.
- **No RBAC/multi-tenancy enforcement exists in this build** — the `Role`
  field on a mock user is cosmetic. Anyone using this preview can perform
  any action; this is correct for an internal, single-team demo and would
  need to be revisited before any real user data touches this data layer.
- **Every module ships with mock data, not empty scaffolding** — per the
  brief ("do not leave placeholder pages"), all CRUD is real against the
  mock store (create/edit/delete, drag-and-drop, filters), just not
  persisted beyond the browser.
- Future sessions resuming either path (backend integration, or continuing
  mock-only) should read this ADR first — it is the record of why two
  parallel implementations exist side by side.
