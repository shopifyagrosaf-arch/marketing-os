# ADR 0006: Manual publishing/analytics first, API integrations phased

**Status:** Accepted
**Date:** 2026-07-11

## Context

Direct publishing APIs (Meta, LinkedIn, Google Business Profile, YouTube)
have varying access tiers, review processes, and rate limits that are
outside this project's control and can block a launch date entirely if
treated as a hard dependency. The stakeholder explicitly chose a hybrid
model during discovery: manual publishing/analytics entry for the MVP, with
direct API integrations as an explicit, separate Phase 2.

## Decision

Publishing and Analytics are two independent modules (an MVP content item
can be "published" by a human pasting a URL back into the system, while
analytics for that same item may later be fetched automatically via a
platform API, or vice versa — neither depends on the other's implementation
being manual or automated). Both are designed behind a
provider/adapter-shaped interface from the start, even though Sprint 1 has
not yet built the content/publishing data model itself (that's Sprint 3+
per the roadmap) — this ADR exists now so that when it is built, it isn't
built as a hardcoded manual-only flow that then needs a rewrite.

## Consequences

- The eventual `Publisher`/`AnalyticsSource` abstraction must be designed
  before the first "manual" implementation is written, not bolted on after,
  or Phase 2 becomes a rewrite instead of an additive change.
- MVP ships without being blocked on any third-party API approval process.
- Data model for a "published" content item must record enough (platform,
  URL, timestamp, publisher identity) to be meaningful regardless of whether
  a human or an API call produced it — the schema shouldn't have a
  manual-only shape.
