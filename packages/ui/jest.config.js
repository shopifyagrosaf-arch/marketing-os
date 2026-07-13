/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '\\.module\\.css$': '<rootDir>/jest/css-modules-mock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
