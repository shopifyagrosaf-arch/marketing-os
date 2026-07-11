# ADR 0002: Modular monolith over microservices at launch

**Status:** Accepted
**Date:** 2026-07-11

## Context

Launch scale is 35–50 users across 4 brands; future target scale (500+
users, 50+ brands, multi-company SaaS) is real but not immediate.
Microservices from day one would mean distributed-transaction complexity,
inter-service auth, and deployment overhead long before the team or the
traffic justifies it — and this platform is being built by a small team that
needs to ship an MVP in a matter of months, not stand up service mesh
infrastructure first.

## Decision

Build `apps/api` as a single NestJS application with feature modules
(`modules/auth`, `modules/brands`, `modules/organizations`, `modules/roles`,
...) that have clear boundaries (each owns its own service/controller/DTOs,
talks to others only through Nest's DI, never reaches into another module's
internals). This is a "modular monolith": one deployable, but structured so
any module can be extracted into its own service later without a rewrite —
only a change to how it's deployed and how other modules reach it (in-process
call → network call).

## Consequences

- Module boundaries must be respected even though there's no technical
  enforcement (no separate deploy) yet — a module directly importing another
  module's Prisma queries instead of its service is exactly the kind of
  coupling that makes future extraction expensive.
- Scaling story for the "future scale" target (ADR 0001) is: extract the
  highest-load module (likely AI generation or Analytics ingestion once
  built) into its own service first, not a rewrite of everything at once.
- Revisit this ADR if a single module's resource profile (e.g. AI generation
  queue depth) starts genuinely contending with the rest of the API for
  compute — that's the trigger for extraction, not a calendar date.
