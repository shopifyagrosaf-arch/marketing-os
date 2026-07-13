# Roadmap

Tracks actual delivery status against the phased plan agreed during
architecture design (see `docs/ARCHITECTURE.md`, `docs/adr/`). Update the
status column as each sprint closes — this file reflects what's actually
shipped, not what was originally planned; if a sprint's real scope diverges
from what's listed here, this file is what should change, not history.

## Pivot (2026-07-13): UI Preview

Mid-Sprint-4, priorities changed: ship a mock-data-only internal tool
covering 11 modules the same day, deferring backend integration until the
UI is reviewed and approved. See
[ADR 0011](docs/adr/0011-ui-preview-mock-data-pivot.md) and
[`docs/SPRINT_UI_PREVIEW.md`](docs/SPRINT_UI_PREVIEW.md). The phased plan
below (Sprints 4–10, multi-tenant SaaS ambition) is **paused, not
cancelled** — it resumes from `v0.3.0-sprint3` once the UI is approved and
a backend-integration decision is made (keep the NestJS/Postgres backend
already built, or re-platform, per ADR 0011's consequences).

## Phase 1 — MVP (current)

Core content workflow, manual publishing/analytics, AI drafting (Mode 1),
in-app/email notifications, foundational RBAC and admin tooling.

| Sprint | Scope | Status |
|---|---|---|
| 1 | Auth/SSO, Organization→Brand schema, RBAC foundation, brand switcher shell | ✅ Done — `v0.1.0-foundation` |
| 2 | User/Role/Permission management (full CRUD, not just UI), Organization/Brand admin, Admin Dashboard | ✅ Done — `v0.2.0-sprint2` |
| 3A | Design System (`packages/ui`) + Admin UI Foundation — inserted ahead of the original Sprint 3 so its UI (and every sprint after) is built on real components, not more inline-styled pages | ✅ Done — `v0.3.0-sprint3` |
| 3B | Content Request intake + workflow engine skeleton (status enum + transitions) — the original Sprint 3 scope, run right after 3A | ✅ Done — `v0.3.0-sprint3` |
| 4 | AI Mode 1 integration (async drafting), Content Editor with version history | ⏳ Next |
| 5 | Brand Review stage + Compliance conditional branch + compliance rule config | Planned |
| 6 | Design upload/versioning + Design Approval stage | Planned |
| 7 | Marketing Head Approval + Publishing Queue (manual, per docs/adr/0006) + audit log wiring | Planned |
| 8 | Notification engine (in-app + email) + escalation timers (24/48/72h) | Planned |
| 9 | Manual analytics entry + per-brand/cross-brand dashboards | Planned |
| 10 | Content Library search/filter + UAT + launch hardening | Planned |

## Phase 2 — Post-MVP

- Mode 2 AI creative generation (images/video), always Designer-reviewed
  before publish (never bypasses the Design stage).
- WhatsApp notification channel (high-priority only).
- Direct publishing API integrations: Meta, LinkedIn, Google Business
  Profile, YouTube (see docs/adr/0006 — Publishing and Analytics stay
  independent modules regardless of manual vs. automated).
- Automated analytics fetch: GA4, Meta Insights, Google Search Console.
- Disclaimer library, content templates, DAM versioning UI.

## Phase 3

- WordPress/Shopify publish integration.
- ERP/CRM integration.
- Multi-language content (locale field already present on Brand/content
  models from Sprint 1 — this phase is UI/workflow support, not a schema change).
- Bulk historical content/asset import.
- MS Teams/Slack notifications.
- Native mobile app.

## Phase 4

- Scale hardening toward the confirmed future target (500+ users, 50+
  brands) — extract the highest-load module (likely AI generation or
  analytics ingestion) out of the modular monolith first if profiling shows
  it's warranted (see docs/adr/0002); this is a trigger-based decision, not
  a calendar one.
- Multi-company SaaS packaging (the Organization→Brand hierarchy from
  Sprint 1 / docs/adr/0001 exists specifically so this doesn't require a
  data-model rewrite).

## Notes on scope changes vs. the original plan

- Sprint 2 ended up broader than "User/Role management **UI**" as
  originally sketched — it delivered full backend CRUD (Users, Roles,
  Permissions, Organization, Brand admin) plus the Admin Dashboard UI, since
  the UI has nothing to render without the underlying endpoints. Sprints
  3+ above are renumbered against what's actually left, not the original count.
- Sprint 3 (Content Request intake) was split into 3A and 3B at the user's
  request: 3A inserts a Design System (`packages/ui`) and Admin UI
  Foundation ahead of the original Sprint 3 scope, which then runs as 3B —
  so the new Content Request UI (and everything after it) is built on real
  components from the start instead of adding more inline-styled pages that
  would need refactoring later (Sprint 1/2's admin pages were inline-styled
  "functional, not visually polished" placeholders, per `docs/SPRINT_2.md`).
  Sprint 4 onward keeps its original numbering — only Sprint 3 split into two.
