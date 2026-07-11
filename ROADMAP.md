# Roadmap

Tracks actual delivery status against the phased plan agreed during
architecture design (see `docs/ARCHITECTURE.md`, `docs/adr/`). Update the
status column as each sprint closes — this file reflects what's actually
shipped, not what was originally planned; if a sprint's real scope diverges
from what's listed here, this file is what should change, not history.

## Phase 1 — MVP (current)

Core content workflow, manual publishing/analytics, AI drafting (Mode 1),
in-app/email notifications, foundational RBAC and admin tooling.

| Sprint | Scope | Status |
|---|---|---|
| 1 | Auth/SSO, Organization→Brand schema, RBAC foundation, brand switcher shell | ✅ Done — `v0.1.0-foundation` |
| 2 | User/Role/Permission management (full CRUD, not just UI), Organization/Brand admin, Admin Dashboard | ✅ Done — `v0.2.0-sprint2` |
| 3 | Content Request intake + workflow engine skeleton (status enum + transitions) | ⏳ Next |
| 4 | AI Mode 1 integration (async drafting), Content Editor with version history | Planned |
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
