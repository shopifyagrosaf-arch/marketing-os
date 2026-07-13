/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    // tsconfig.json sets jsx:"preserve" for Next's own SWC/Babel pipeline to
    // consume at build time — ts-jest has no such downstream step, so under
    // test it needs JSX compiled directly to React.createElement calls.
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: { ...require('./tsconfig.json').compilerOptions, jsx: 'react-jsx' } }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.module\\.css$': '<rootDir>/jest/css-modules-mock.js',
  },
  // @agrosaf/ui ships raw TSX from the workspace (see packages/ui) — Jest
  // ignores node_modules for transforms by default, which would leave its
  // .tsx source unparsed; carve out an exception the same way next.config.js's
  // transpilePackages does for the Next build.
  transformIgnorePatterns: ['/node_modules/(?!@agrosaf)'],
  setupFilesAfterEnv: ['<rootDir>/jest/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};
