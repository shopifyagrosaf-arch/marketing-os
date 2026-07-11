// Runs via Jest's `setupFiles` — guaranteed to execute before any test file
// (and therefore before it `import`s AppModule) is evaluated. This matters
// because ConfigModule.forRoot() reads/validates process.env as soon as
// app.module.ts is imported, not when the testing module is compiled — env
// vars set inside a spec file's own top-level code run too late.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
process.env.AUTH_SECRET = 'e2e-test-secret-that-is-at-least-32-characters-long';
