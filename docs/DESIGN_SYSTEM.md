# Design System (`packages/ui`)

Introduced in Sprint 3A to replace the inline `style={{...}}` markup used
throughout Sprint 1/2's admin UI (see `docs/SPRINT_2.md`'s known
limitations: "functional, not visually polished"). See
[ADR 0009](adr/0009-design-system-css-modules.md) for why CSS Modules were
chosen over Tailwind/CSS-in-JS.

## Tokens

`packages/ui/src/tokens.css` defines every color/spacing/radius/shadow/font
value as a CSS custom property under `:root`, imported once globally from
`apps/web/src/app/layout.tsx` (`import '@agrosaf/ui/tokens.css'`). Components
read semantic aliases (`--color-text`, `--color-border`, ...), never the raw
palette (`--color-neutral-900`), so a future rebrand is a token-file edit,
not a per-component one.

## Components

| Component | Purpose |
|---|---|
| `Button` | `primary`/`secondary`/`danger`/`ghost` variants, `sm`/`md` sizes |
| `FormField`, `TextInput`, `Textarea`, `Select`, `Checkbox` | Labeled form controls; `FormField` renders the label + hint/error, the control is passed as `children` |
| `Table` | Styled wrapper around a native `<table>` (horizontally scrollable container, no semantics hidden) |
| `Card` | Bordered/shadowed content surface |
| `Container` | Page-level max-width + padding |
| `Badge` | Status pill (`neutral`/`success`/`warning`/`danger`/`info` tones) |
| `Alert` | Inline message; defaults `role="alert"` for `tone="error"`, `role="status"` otherwise |
| `Spinner` | Accessible (`role="status"`) loading indicator |
| `EmptyState` | "No results" placeholder with optional description/action |
| `Pagination` | Previous/Next pager for the `{ items, total, page, limit }` shape every paginated admin endpoint returns; renders nothing when everything fits on one page |

Every component ships a co-located `Component.module.css` and
`Component.spec.tsx` (React Testing Library). `src/index.ts` is the single
public entry point — import from `@agrosaf/ui`, never from a component's
internal path.

## Consuming the package

- **Next.js** (`apps/web`): `@agrosaf/ui` ships raw `.tsx`/`.module.css`
  source (no build step), transpiled by Next the same way
  `@agrosaf/shared-types` already was — see `next.config.js`'s
  `transpilePackages`.
- **Jest**: `.module.css` imports resolve to a small Proxy-based mock
  (`css-modules-mock.js`, present in both `packages/ui/jest/` and
  `apps/web/jest/`) that echoes back the requested class name so
  `styles.button` reads as `'button'` in assertions instead of `undefined`.
  The mock's `__esModule: false` guard is load-bearing — see the comment in
  the file before changing it.
- Jest also needs `transformIgnorePatterns: ['/node_modules/(?!@agrosaf)']`
  in `apps/web/jest.config.js` so ts-jest transforms the package's raw TSX
  instead of skipping it as a `node_modules` dependency.

## Admin UI Foundation (`apps/web/src/components/shell/`)

Built on top of `packages/ui`, not part of the reusable package itself —
these encode this app's structure, not generic reusable UI:

- `AppHeader` — top app bar (brand mark, primary nav, brand switcher, sign out).
- `AdminSidebar` — `/admin/*` section nav.
- `PageHeader` — title (+ optional description/actions) row at the top of
  every admin/content page.

## Adding a new component

1. `packages/ui/src/components/<Name>/<Name>.tsx` + `.module.css` + `.spec.tsx`.
2. Read colors/spacing from `tokens.css` custom properties — never a raw
   hex/px literal.
3. Export it from `packages/ui/src/index.ts`.
4. Only add it once something actually consumes it — this package has no
   Storybook/playground, so an unused component has no way to be reviewed
   visually and tends to drift from what real usage needs.
