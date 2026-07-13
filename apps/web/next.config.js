/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @agrosaf/shared-types and @agrosaf/ui both ship raw TS/TSX from the
  // workspace (see packages/shared-types, packages/ui) — Next.js needs
  // this to transpile them like local source instead of expecting
  // pre-built JS in node_modules.
  transpilePackages: ['@agrosaf/shared-types', '@agrosaf/ui'],
};

module.exports = nextConfig;
