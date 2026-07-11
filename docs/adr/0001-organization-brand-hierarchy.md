# ADR 0001: Organization → Brand hierarchy for multi-tenancy readiness

**Status:** Accepted
**Date:** 2026-07-11

## Context

Agrosaf Group operates 4 brands through one shared marketing team today.
During requirements discovery, the stakeholder confirmed the platform's
long-term direction explicitly includes becoming a multi-company SaaS
product (500+ users, 50+ brands, multiple companies) — not a hypothetical,
a stated target. If `Brand` were the top-level tenant unit now, introducing
a second company later would require migrating every brand-scoped table to
sit under a new parent entity, plus rewriting every query that assumes
brand-is-root.

## Decision

Model `Organization` as the top-level tenant, with `Brand` as a child of
`Organization`, even though exactly one `Organization` ("Agrosaf Group")
exists today. All brand-scoped tables reference `Brand`, which references
`Organization`.

## Consequences

- Every "org-wide" role check and cross-brand query must filter by
  `organizationId` in addition to any brand filter, from day one — slightly
  more query complexity now, in exchange for not needing a breaking schema
  migration when a second company is onboarded.
- The seed script and RBAC guards already assume this hierarchy
  (`BrandAccessGuard`/`OrgRoleGuard` both scope through `organizationId`).
- If the SaaS direction is ever abandoned, this layer becomes a harmless
  no-op (one row, never queried across), not something that needs to be
  ripped out.
