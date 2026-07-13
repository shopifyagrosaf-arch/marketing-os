# Sprint 3A — Design System & Admin UI Foundation

Status: **complete**. All unit tests pass; `apps/web` builds and lints clean
under strict TypeScript; `packages/ui` builds/lints/tests clean standalone.

This sprint was inserted ahead of the roadmap's original Sprint 3 (Content
Request Intake — see `docs/SPRINT_3B.md`) at the user's request, so that
Sprint 3B's new UI (and every sprint after it) is built on a real component
library instead of adding more inline-styled pages to refactor later. See
`ROADMAP.md` for how this renumbers the phased plan.

## Scope delivered

- **`packages/ui`** (new workspace package): design tokens
  (`src/tokens.css` — colors/spacing/radii/shadows/typography as CSS custom
  properties) plus 11 components (`Button`, `FormField`/`TextInput`/
  `Textarea`/`Select`/`Checkbox`, `Table`, `Card`, `Container`, `Badge`,
  `Alert`, `Spinner`, `EmptyState`, `Pagination`) — see
  `docs/DESIGN_SYSTEM.md` for the full inventory and consumption details.
  Styled with CSS Modules per [ADR 0009](adr/0009-design-system-css-modules.md)
  — no new runtime dependency added to the project.
- **Admin UI Foundation** (`apps/web/src/components/shell/`): `AppHeader`,
  `AdminSidebar`, `PageHeader` — replace the inline-styled header/nav/`<h1>`
  built ad hoc in Sprint 1/2.
- **Refactored every existing page** (`(dashboard)/layout.tsx`,
  `admin/layout.tsx`, all six `/admin/*` pages, the dashboard placeholder,
  `loading.tsx`/`error.tsx`, `/login`, `BrandSwitcher`) onto the design
  system — same behavior and endpoints as Sprint 1/2, no inline `style={{}}`
  objects left except a handful of one-off layout tweaks (documented inline)
  that don't warrant a new shared component.
- **Users list now renders real pagination** (`Pagination`, wired to the
  `{ items, total, page, limit }` shape `GET /users` has returned since
  Sprint 2 but the frontend never consumed beyond a bare total count) and an
  `EmptyState` for a no-results search — the only behavior change beyond
  pure re-styling, and it's completing existing API surface, not adding new scope.

## Review findings from this sprint (fixed, not just noted)

1. **The Jest CSS-Modules mock silently broke every `className` assertion.**
   The first version of `css-modules-mock.js` was a plain
   `new Proxy({}, { get: (_, prop) => prop })`. TypeScript's
   `__importDefault` interop helper checks `mod.__esModule` to decide
   whether to unwrap `.default` — since the unguarded proxy answered *that*
   property access with the truthy string `'__esModule'` too, the helper
   treated the proxy as already-the-module and returned `styles.default`
   (literally the string `'default'`) instead of the proxy itself. Every
   `styles.foo` lookup in a component then silently evaluated to `undefined`
   on the *string* `'default'`, `.filter(Boolean)` dropped the empty result,
   and `<Button>`/`<Badge>` rendered with `className=""`. Caught because
   `Button.spec.tsx`/`Badge.spec.tsx` explicitly assert on `.className`;
   every other component's tests happened not to, so this would otherwise
   have shipped invisibly. **Fix**: the mock's `get` trap now special-cases
   `__esModule` to return `false` (the standard `identity-obj-proxy`
   pattern) — see the comment in `css-modules-mock.js`.
2. **ts-jest doesn't know Next's `jsx: "preserve"` tsconfig setting.**
   `apps/web/tsconfig.json` sets `jsx: "preserve"` for Next's own SWC/Babel
   pipeline to consume at build time; ts-jest has no such downstream step,
   so under test it needs JSX compiled directly to `React.createElement`
   calls. This was latent since Sprint 1 (zero `.tsx` test files existed
   before this sprint) and surfaced the moment component tests were added.
   **Fix**: `apps/web/jest.config.js`'s ts-jest transform now overrides
   `jsx: 'react-jsx'` on top of the project's other compiler options,
   instead of loading `tsconfig.json` verbatim.
3. **`@agrosaf/ui`'s raw TSX wasn't reaching ts-jest at all.** Jest ignores
   `node_modules` for transforms by default; since the workspace package
   resolves through a symlink under `node_modules/@agrosaf/ui`, its `.tsx`
   source was being skipped rather than transformed, the same class of
   problem `next.config.js`'s `transpilePackages` solves for the Next
   build. **Fix**: `transformIgnorePatterns: ['/node_modules/(?!@agrosaf)']`
   in `apps/web/jest.config.js`.

## Known limitations / explicitly deferred (not bugs)

- No Storybook or visual playground — components are reviewed in the
  context of the pages that consume them. Acceptable at 11 components;
  revisit if the inventory grows large enough that visual regressions
  become hard to catch from page-level review alone.
- No dark mode — `tokens.css` defines a single light palette. Nothing in
  the SRS/roadmap calls for dark mode; adding token values without a
  consumer would be speculative.
- Brand-level theming (per-brand color/logo) is out of scope — the admin
  shell is deliberately brand-neutral (Agrosaf Group operates one shared
  marketing team across all 4 brands, per `docs/ARCHITECTURE.md`).
- `AppHeader`/`AdminSidebar`/`PageHeader` live in `apps/web`, not
  `packages/ui` — they encode this app's navigation structure, not
  generic reusable UI. Don't move them into the package just because they
  "feel" reusable; only do that once a second consuming app actually needs them.

## Running this sprint's tests

```bash
npm run test --workspace=packages/ui     # 10 suites / 21 tests
npm run test --workspace=apps/web        # 5 suites / 11 tests
npm run lint --workspace=packages/ui
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```
