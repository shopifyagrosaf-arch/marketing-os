# ADR 0007: Tech stack — Next.js / NestJS / PostgreSQL+Prisma / Redis / R2 / Auth.js

**Status:** Accepted
**Date:** 2026-07-11

## Context

The stakeholder specified this stack directly ahead of the Technical
Architecture phase, with one explicit hard constraint: the system must be
**portable across cloud providers without code changes** — no hosting
preference was given beyond "cloud-native," and the internal dev team hands
off deployment ownership to internal IT later, so the stack shouldn't lock
either party into a single vendor's proprietary services.

## Decision

- Frontend: Next.js (Vercel-deployable, but not Vercel-only)
- Backend: NestJS (see ADR 0002 for monolith-vs-microservices)
- Database: PostgreSQL via Prisma
- Object storage: Cloudflare R2, preferred, behind an S3-compatible
  interface so AWS S3 is a drop-in swap
- Queue: Redis + BullMQ
- Auth: Auth.js (see ADR 0004 for why the API doesn't verify its token directly)
- Hosting: Railway, DigitalOcean, or AWS — Docker + CI/CD, not tied to one

## Consequences

- No provider-specific SDK (e.g. a Vercel-only API, an AWS-only queue
  service) may be used in core business logic — only in an adapter that
  could be swapped. This is a constraint every future module must respect,
  not just an initial choice.
- Self-hosting Postgres/Redis via Docker Compose (see
  `docker/docker-compose.yml`) is the default local/self-hosted path;
  managed equivalents (RDS, Upstash, etc.) are drop-in for production without
  changing `DATABASE_URL`/`REDIS_URL` consumers.
- Revisit this ADR only if a specific provider's managed service becomes a
  hard requirement (e.g. a compliance mandate for a specific region/vendor)
  — not for convenience alone.
