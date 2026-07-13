// See packages/ui/jest/css-modules-mock.js for the full rationale (the
// __esModule guard matters — an unguarded proxy breaks TS's __importDefault
// interop and silently turns every `styles.foo` lookup into `undefined`).
module.exports = new Proxy(
  {},
  {
    get: (_target, prop) => (prop === '__esModule' ? false : prop),
  },
);
