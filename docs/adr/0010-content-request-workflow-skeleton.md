# ADR 0010: Content request workflow as an in-module transition table, not a generic state-machine engine

**Status:** Accepted
**Date:** 2026-07-11

## Context

Sprint 3B's roadmap scope is explicitly "Content Request intake + workflow
engine skeleton (status enum + transitions)" — the first of several sprints
(5: Brand Review + Compliance, 6: Design Approval, 7: Marketing Head
Approval + Publishing Queue) that all extend the same request's lifecycle
toward the SRS's 10-step approval pipeline, ending in the Content Library
(Sprint 10). Two designs were possible now:

1. A generic, reusable state-machine engine (e.g. a `common/workflow/`
   module with a configurable transition-table type any entity could plug
   into), anticipating that later sprints add their own workflow-bearing
   entities.
2. A concrete `ContentRequestStatus` enum (`schema.prisma`) plus a plain
   `CONTENT_REQUEST_TRANSITIONS` lookup table and `assertValidContentRequestTransition`
   function living in `modules/content-requests/`, extended in place as
   later sprints add statuses.

`docs/FOLDER_STRUCTURE.md`'s established convention (`common/` holds
cross-cutting code once a *second* module actually needs it, not
speculatively) and the roadmap's own wording — "workflow engine skeleton",
singular, for *this* entity — both point at option 2. Nothing in the SRS
indicates a second workflow-bearing entity is coming; Sprints 5-7 all
extend `ContentRequest`, they don't introduce a parallel one.

## Decision

`ContentRequestStatus` is a real Prisma enum (`DRAFT`, `SUBMITTED`,
`CANCELLED` today). `CONTENT_REQUEST_TRANSITIONS` (a plain
`Record<ContentRequestStatus, ContentRequestStatus[]>` in
`modules/content-requests/content-request-workflow.ts`) is the single
source of truth for which transitions are legal;
`assertValidContentRequestTransition` is the single enforcement point,
called from `ContentRequestsService.transition`. Sprints 5-7 add new enum
values and new table rows here — they do not introduce a second state
machine or a `common/workflow/` abstraction unless a second, unrelated
workflow-bearing entity actually appears.

Two related decisions for this sprint's scope specifically:
- **Intake has no `@Roles` restriction** — any role with `BrandAccess` to
  the brand (via `BrandAccessGuard` alone, no `RolesGuard`) can create,
  list, and view content requests. The SRS's approval *gatekeeping*
  (Brand Review, Compliance, Design Approval, Marketing Head Approval) is
  explicitly later-sprint scope; restricting *who can request content* now
  would invent a policy the SRS hasn't specified yet.
- **Edit/transition permission is ownership-based, not role-based**: the
  requester, or any org-wide role (`OrgAccessService.getOrgWideRole`,
  same helper `OrgRoleGuard` and `/auth/me` already use), can modify a
  request. No brand-scoped role (e.g. `BRAND_MANAGER`) gets a special case
  yet, since the SRS doesn't specify one for the intake stage — adding one
  now would be a guess, not a documented requirement.

## Consequences

- Extending the pipeline in Sprints 5-7 means: add enum values to
  `ContentRequestStatus` (a migration), add rows to
  `CONTENT_REQUEST_TRANSITIONS`, and extend `assertCanModify`-style
  authorization checks per stage — a predictable, additive change to one
  file each, not a rewrite.
- If a second, genuinely distinct workflow-bearing entity appears later
  (e.g. a separate Campaign approval flow unrelated to `ContentRequest`),
  *that* is the trigger to extract a shared `common/workflow/` abstraction
  — not before, per the same "move to `common/` only once a second
  consumer needs it" rule Sprint 2 established for `AuditLogService`/`OrgAccessService`.
- Because intake has no role gate, a role list intended to be read-only
  (e.g. `SALES_VIEW_ONLY`) can currently create content requests if granted
  `BrandAccess` to a brand at all. Acceptable today since content requests
  carry no side effects until a later sprint's approval stages act on them;
  revisit if the SRS clarifies that specific roles should be blocked from
  intake.
