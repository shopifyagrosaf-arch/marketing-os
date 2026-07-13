# Architecture Decision Records

Each ADR captures one significant, hard-to-reverse technical decision: the
context that forced it, what was decided, and what it costs. Read these
before proposing to change any of them — several look like they could be
simplified in isolation but exist because of a constraint documented here.

| # | Title | Status |
|---|---|---|
| [0001](0001-organization-brand-hierarchy.md) | Organization → Brand hierarchy for multi-tenancy readiness | Accepted |
| [0002](0002-modular-monolith.md) | Modular monolith over microservices at launch | Accepted |
| [0003](0003-brand-context-via-header.md) | Brand context via request header, not JWT claim | Accepted |
| [0004](0004-auth-two-token-pattern.md) | Auth.js session + short-lived server-minted API JWT | Accepted |
| [0005](0005-rbac-string-roles.md) | RBAC as string role + BrandAccess join, not a fixed enum | Accepted |
| [0006](0006-phased-publishing-analytics.md) | Manual publishing/analytics first, API integrations phased | Accepted |
| [0007](0007-tech-stack-selection.md) | Tech stack: Next.js / NestJS / PostgreSQL+Prisma / Redis / R2 / Auth.js | Accepted |
| [0008](0008-role-organization-scoping.md) | Custom roles are organization-scoped; built-in roles are global | Accepted |
| [0009](0009-design-system-css-modules.md) | Design system styled with CSS Modules, not Tailwind/CSS-in-JS | Accepted |
| [0010](0010-content-request-workflow-skeleton.md) | Content request workflow as an in-module transition table, not a generic state-machine engine | Accepted |

New ADRs: copy [`0000-template.md`](0000-template.md), number it
sequentially, and add a row above.
