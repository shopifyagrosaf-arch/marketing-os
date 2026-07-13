# ADR 0009: Design system styled with CSS Modules, not Tailwind/CSS-in-JS

**Status:** Accepted
**Date:** 2026-07-11

## Context

Sprint 1/2's admin UI used inline `style={{...}}` objects directly on JSX
elements (see `docs/SPRINT_2.md`'s known limitations: "functional, not
visually polished"). Sprint 3A introduces a real design system
(`packages/ui`) and an Admin UI Foundation shell, which need a real styling
approach shared across every component and every consuming page.

Three realistic options existed:

1. **Tailwind CSS** — utility classes, no separate stylesheet per component.
2. **CSS-in-JS** (styled-components, Emotion, vanilla-extract) — colocated
   styles as JS/TS, runtime or build-time generated.
3. **CSS Modules** — plain `.module.css` per component, scoped class names,
   zero runtime, natively supported by Next.js with no extra dependency.

`docs/ARCHITECTURE.md` and ADR 0007 are explicit that this project optimizes
for cloud portability and minimal vendor/framework lock-in — no
provider-specific SDKs in core logic, and by extension no styling
dependency that couples every component to a specific runtime library's
API. `apps/web`'s `package.json` also currently has zero styling
dependencies at all.

## Decision

Style `packages/ui` and all consuming pages with CSS Modules
(`ComponentName.module.css` next to `ComponentName.tsx`), reading colors/
spacing/radii from CSS custom properties defined once in
`packages/ui/src/tokens.css` (imported globally from `apps/web/src/app/layout.tsx`).

No new runtime dependency is added: Next.js compiles `.module.css` natively
via `transpilePackages` (already used for `@agrosaf/shared-types`); Jest
resolves `.module.css` imports through a small local Proxy-based mock
(`apps/web/jest/css-modules-mock.js`, `packages/ui/jest/css-modules-mock.js`)
instead of a package like `identity-obj-proxy`.

## Consequences

- No utility-class vocabulary to learn or keep consistent (Tailwind's
  upside) — component authors write ordinary CSS, scoped automatically by
  the build tool appending a content hash to each class name.
- No CSS-in-JS runtime cost, and no risk of a styling library becoming
  unmaintained/incompatible with a future React version — CSS Modules are a
  bundler feature, not a dependency.
- Cross-component consistency depends on discipline (always reading from
  `tokens.css` custom properties, never hard-coding a hex color) rather than
  a type system enforcing it — acceptable at the current single-designer-
  system scale; revisit if the component count grows large enough that a
  linting rule (e.g. banning raw color literals in `.module.css` files)
  becomes worth the setup cost.
- The Jest CSS-module mock's `__esModule` handling is a subtle, easy-to-
  regress detail (see the comment in `css-modules-mock.js`) — anyone
  replacing it with a different mock/library must preserve that behavior or
  every `styles.foo` class-name lookup in a test silently becomes `undefined`.
