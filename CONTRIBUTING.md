# Contributing

This project is built sprint-by-sprint against an approved SRS/PRD/
Architecture. Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and the
relevant `docs/adr/` entries before changing anything those documents cover
— several decisions that look simplifiable in isolation exist because of a
constraint recorded there.

## Branching

- `main` is always deployable.
- Work happens on `sprint-N/<short-description>` branches (e.g.
  `sprint-2/role-management`), merged to `main` via PR once a sprint's scope
  is reviewed and approved.
- Hotfixes: `fix/<short-description>`.

## Commits

Conventional, imperative-mood subject lines:

```
feat(api): add role CRUD endpoints
fix(web): correct brand switcher persistence key
docs(adr): record decision on permission caching
test(api): cover OrgRoleGuard rejection paths
chore: bump prisma to 5.22
```

Prefixes: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.

## Before opening a PR

```bash
npm run lint --workspace=apps/api && npm run lint --workspace=apps/web
npm run test --workspace=apps/api && npm run test:e2e --workspace=apps/api
npm run test --workspace=apps/web
npm run build --workspace=apps/api && npm run build --workspace=apps/web
```

All four must pass. CI (`.github/workflows/ci.yml`) re-runs the same checks
against a real Postgres service container — a green local run that fails in
CI usually means an env-var or migration assumption that only holds locally
(see `docs/SPRINT_1.md`'s review findings for a real example of this).

## Code standards

- TypeScript `strict` mode is on in both apps — do not weaken it to make a
  change compile.
- No `any` outside test files. If you're tempted to reach for it in
  application code, there's almost always a real type available (see
  `src/types/express.d.ts` for the pattern used to type Express request
  augmentations).
- RBAC-sensitive routes must go through the guard chain documented in
  `docs/ARCHITECTURE.md` (`BrandAccessGuard`+`RolesGuard`+`@Roles` for
  brand-scoped actions, `OrgRoleGuard`+`@OrgRoles` for org-wide ones) — never
  hand-roll an authorization check inline in a controller.
- New Prisma models require a real migration
  (`npm run prisma:migrate --workspace=apps/api`, or the offline
  `prisma migrate diff --from-empty ...` approach documented in
  `docs/SPRINT_1.md` if no local database is available), committed alongside
  the schema change — never hand-edit a migration's SQL after it's applied
  anywhere.
- Don't add functionality ahead of the current sprint's approved scope
  (documented per-sprint under `docs/`). Flag it as a future item instead.

## Adding an ADR

Significant, hard-to-reverse technical decisions get an ADR, not just a code
comment. Copy `docs/adr/0000-template.md`, number it sequentially, and add it
to the index in `docs/adr/README.md`.
