// Jest has no CSS loader — CSS Module imports resolve to a Proxy that
// echoes back whatever class name was requested, so `styles.button` in a
// test still yields a stable, readable string instead of undefined.
//
// `__esModule` must stay falsy: TypeScript's `__importDefault` interop
// helper checks `mod.__esModule` to decide whether to unwrap `.default`,
// and since our `get` trap answers *every* property access (including that
// check) with the property name itself, an unguarded trap would make
// `mod.__esModule` a truthy string and short-circuit the helper into
// treating the proxy as already-the-default-export — so `styles.default`
// (not `styles`) becomes the module, and every `styles.foo` lookup below
// silently resolves to `undefined` instead of `'foo'`.
module.exports = new Proxy(
  {},
  {
    get: (_target, prop) => (prop === '__esModule' ? false : prop),
  },
);
