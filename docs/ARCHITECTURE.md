# Architecture

Condensed reference for the system design agreed upon before implementation
began (full SRS v2 / PRD / Information Architecture / Database Design / API
Specification / UI-UX Architecture / Technical Architecture / Roadmap were
produced and approved prior to Sprint 1; this file is the durable summary
that lives with the code).

## Tenancy model: Organization → Brand

Agrosaf Group is the only `Organization` today, with 4 `Brand`s underneath it
(Agrosaf Pharmaceuticals, Alosafe Pharmacare, Medizone, Hospital Marketing).
This layer exists even with a single organization because the platform's
long-term direction is multi-company SaaS — adding a second organization
later must not require a schema migration.

A single shared marketing team operates across all 4 brands. Users are not
siloed per brand: **one login can switch between brands without
re-authenticating** — see "Brand switching" below.

## RBAC model

- **Role** is a plain string identity (`SUPER_ADMIN`, `BRAND_MANAGER`,
  `CONTENT_WRITER`, ... 14 seeded roles), not a fixed enum — Super Admin can
  create custom roles at runtime without a code change.
- **BrandAccess** joins User × Brand × Role. This is what "switch brands
  without logging out" actually is: the JWT never changes, only which
  `BrandAccess` row (and therefore which role) applies to the current
  request.
- Two roles (`SUPER_ADMIN`, `MARKETING_HEAD`) are **org-wide**
  (`Role.isOrgWide`): they implicitly have access to every brand in the
  organization, not just brands with an explicit `BrandAccess` row.
- Two guard families exist:
  - `BrandAccessGuard` + `RolesGuard` + `@Roles(...)` — for actions scoped to
    *the brand currently selected via the `x-brand-id` header*.
  - `OrgRoleGuard` + `@OrgRoles(...)` — for actions not scoped to any single
    brand (e.g. creating a new brand).

## Brand switching (why a header, not the JWT)

The brand a request applies to is passed via the `x-brand-id` HTTP header,
not embedded in the access token. This is deliberate: switching brands is a
UI action (a dropdown), not a re-login, so it cannot require minting a new
token. `BrandAccessGuard` resolves `x-brand-id` → verifies the caller has
access (directly or via an org-wide role) → attaches `request.brandContext`
for the rest of the request pipeline.

## Auth: Auth.js (browser) + short-lived JWT (API) — not the same token

Auth.js (`apps/web`) owns the browser session via Google Workspace /
Microsoft 365 SSO. Its default session token is an **encrypted JWE**, not a
plain signed JWT — so the NestJS API (which verifies via a shared-secret
HS256 `passport-jwt` strategy) cannot verify it directly.

Instead:
1. Browser holds only the Auth.js session cookie — never an API token.
2. Server-side (`apps/web/src/lib/api-token.ts`, marked `server-only`) mints
   a minimal, 5-minute-lived HS256 JWT `{sub, email, name}` signed with the
   same `AUTH_SECRET` both apps share.
3. All browser → API calls go through a same-origin proxy
   (`apps/web/src/app/api/proxy/[...path]/route.ts`), which mints the token
   per-request and forwards `Authorization: Bearer <token>` plus whatever
   `x-brand-id` header the client set. The browser never sees the API token.

This means `AUTH_SECRET` is the one piece of shared configuration the two
apps truly depend on — it must match exactly in every environment.

## Tech stack

Next.js (Vercel-portable) · NestJS · PostgreSQL + Prisma · Redis + BullMQ
(queue infra provisioned, not yet consumed by Sprint 1 logic) · Cloudflare R2
(S3-compatible, storage not yet wired) · Auth.js · Docker/CI-CD. Chosen for
cloud portability — no provider-specific SDKs are to be baked into core
business logic; swapping the storage or hosting provider should not require
touching module code, only the relevant adapter.

## Content request workflow (Sprint 3B)

`ContentRequest` (`schema.prisma`) is brand-scoped, attributed to its
requester, and carries a `ContentRequestStatus` enum
(`DRAFT`/`SUBMITTED`/`CANCELLED` today) enforced by a transition table
(`modules/content-requests/content-request-workflow.ts` — see
[ADR 0010](adr/0010-content-request-workflow-skeleton.md)). This is
intake-only: the SRS's full 10-step approval pipeline (Brand Review,
Compliance, Design upload/Approval, Marketing Head Approval, Publishing,
Content Library) extends this same status enum/transition table across
Sprints 5-7, not a parallel model. Unlike admin endpoints, `/content-requests`
uses `BrandAccessGuard` alone (no `@Roles`) — any role with brand access can
create/view; edit/transition additionally requires being the requester or
holding an org-wide role.

## What's deliberately NOT here yet

Per the approved phased roadmap, these are out of scope until later sprints
and should not be added ahead of schedule:
- The rest of the 10-step approval pipeline beyond intake — Brand Review/
  Compliance (Sprint 5), Design upload/Approval (Sprint 6), Marketing Head
  Approval/Publishing Queue (Sprint 7), Content Library (Sprint 10)
- Direct social platform API integrations (Phase 2 — manual publishing first)
- Direct AI drafting integration on a content request (Sprint 4 — Mode 1)
- WhatsApp/Teams/Slack notification channels
- Any AI generation (Mode 1 or Mode 2)
