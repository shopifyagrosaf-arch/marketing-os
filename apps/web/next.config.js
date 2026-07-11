/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @agrosaf/shared-types ships raw TS from the workspace (see
  // packages/shared-types) — Next.js needs this to transpile it like
  // local source instead of expecting pre-built JS in node_modules.
  transpilePackages: ['@agrosaf/shared-types'],
};

module.exports = nextConfig;
