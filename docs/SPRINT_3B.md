# Sprint 3B — Content Request Intake & Workflow Engine

Status: **complete**. All unit + e2e tests pass; `apps/api` and `apps/web`
both build and lint clean under strict TypeScript.

This is the roadmap's original Sprint 3 scope, run after Sprint 3A (Design
System & Admin UI Foundation) at the user's request — see `ROADMAP.md` for
the renumbering and `docs/SPRINT_3A.md` for what 3A delivered. Its new UI is
built on `packages/ui` and the Admin UI Foundation shell from the start,
rather than adding more inline-styled pages that would need refactoring later.

## Scope delivered

- **`ContentRequest` model** (`schema.prisma`, migration
  `20260711140000_content_request_intake`): brand-scoped (`brandId`),
  attributed to its requester (`requestedById`), with `title`,
  `description`, free-form `contentType`/`channel` strings (see
  [ADR 0010](adr/0010-content-request-workflow-skeleton.md) for why these
  aren't fixed enums yet), optional `dueDate`, and a real Prisma enum
  `ContentRequestStatus` (`DRAFT` | `SUBMITTED` | `CANCELLED`).
- **Workflow engine skeleton**
  (`modules/content-requests/content-request-workflow.ts`):
  `CONTENT_REQUEST_TRANSITIONS` lookup table +
  `assertValidContentRequestTransition`, the single enforcement point for
  legal status changes. See ADR 0010 for why this lives in the feature
  module rather than a generic `common/workflow/` abstraction, and how
  Sprints 5-7 are expected to extend it.
- **`ContentRequestsService`/`Controller`** (`GET/POST /content-requests`,
  `GET/PATCH /content-requests/:id`, `PATCH /content-requests/:id/status`):
  brand-scoped via `BrandAccessGuard` alone (no `@Roles` restriction —
  intake is open to any role with brand access); edit/transition additionally
  requires being the requester or holding an org-wide role
  (`OrgAccessService.getOrgWideRole`, the same helper `OrgRoleGuard` uses).
  Every create/update/status-change writes through the existing
  `AuditLogService`.
- **Frontend** (`apps/web/src/app/(dashboard)/content-requests/`): list +
  create form (paginated via the design system's `Pagination`), and a
  detail page with an edit form (while `DRAFT`) and transition actions
  (Submit/Cancel/Withdraw) that mirror `CONTENT_REQUEST_TRANSITIONS`. Added
  a "Content Requests" link to `AppHeader`, visible to every authenticated
  user (not admin-gated), matching the open-intake RBAC decision above.

### Endpoints added

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/content-requests` | `BrandAccessGuard` | Paginated, optional `?status=` filter |
| GET | `/content-requests/:id` | `BrandAccessGuard` | 404 if outside the resolved brand |
| POST | `/content-requests` | `BrandAccessGuard` | Creates in `DRAFT`; any brand-accessing role |
| PATCH | `/content-requests/:id` | `BrandAccessGuard` | `DRAFT` only; requester or org-wide role |
| PATCH | `/content-requests/:id/status` | `BrandAccessGuard` | Validated transition; requester or org-wide role |

## Review findings from this sprint (fixed, not just noted)

No defects were found in this sprint's own code during review (the notable
bug this round — the Jest CSS-Modules mock's `__esModule` handling — belongs
to Sprint 3A; see `docs/SPRINT_3A.md`). One design question was resolved
during review rather than left ambiguous: whether intake should be
role-gated. Decided against it and documented why in
[ADR 0010](adr/0010-content-request-workflow-skeleton.md), rather than
picking a role list without SRS backing.

## Known limitations / explicitly deferred (not bugs)

- Only three statuses exist (`DRAFT`/`SUBMITTED`/`CANCELLED`) — the rest of
  the 10-step pipeline (Brand Review, Compliance, Design upload/Approval,
  Marketing Head Approval, Publishing, Content Library) is later-sprint
  scope per `ROADMAP.md`; this sprint's job was the intake stage and the
  transition-table *mechanism*, not the full pipeline.
- No AI drafting integration yet (Sprint 4) — a `ContentRequest` today is
  just structured metadata, no draft content attached.
- `contentType`/`channel` have no fixed taxonomy or a dedicated admin
  screen to manage one — free-form strings, matching `Permission.action`'s
  existing precedent (see ADR 0010). Revisit if/when the SRS specifies an
  exhaustive list.
- No confirmation dialog before cancelling/withdrawing a request — the
  design system doesn't yet have a `Modal`/`ConfirmDialog` component; one
  wasn't added speculatively (see `docs/DESIGN_SYSTEM.md`'s "only add a
  component once something consumes it"). Add it when a real destructive
  action needs confirming.
- Brand-scoped roles (e.g. `BRAND_MANAGER`) have no special edit/transition
  privilege over a request they didn't author — only the requester or an
  org-wide role does. Acceptable for an intake-only stage; likely to change
  once Brand Review (Sprint 5) needs a Brand Manager to act on requests
  submitted by others in their brand.

## Running this sprint's tests

```bash
npm run test --workspace=apps/api        # 8 suites / 46 tests
npm run test:e2e --workspace=apps/api    # 4 suites / 17 tests
npm run test --workspace=apps/web        # 5 suites / 11 tests
npm run lint --workspace=apps/api
npm run build --workspace=apps/api
npm run build --workspace=apps/web
```
