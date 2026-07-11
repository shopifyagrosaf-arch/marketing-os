import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

// Env vars come from test/jest-e2e.setup.ts (Jest setupFiles) — see
// app.e2e-spec.ts for why they can't be set in this file's own top-level code.

const CALLER = {
  id: 'caller1',
  email: 'admin@agrosaf.com',
  name: 'Admin',
  organizationId: 'org1',
  status: 'ACTIVE',
};

function tokenFor(email: string) {
  return jwt.sign({ sub: email, email, name: 'Caller' }, process.env.AUTH_SECRET as string, {
    algorithm: 'HS256',
    expiresIn: '5m',
  });
}

/**
 * Proves OrgRoleGuard (org-wide RBAC, distinct from the brand-scoped chain
 * covered by brands.e2e-spec.ts) is actually wired to a real route, not just
 * unit-tested in isolation — same rationale as the Sprint 1 review finding
 * documented in docs/SPRINT_1.md.
 */
describe('Users (e2e) — org-wide RBAC', () => {
  let app: INestApplication;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    brandAccess: { findFirst: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeAll(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(CALLER),
        create: jest.fn().mockResolvedValue({ id: 'new-user', email: 'writer@agrosaf.com' }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      brandAccess: { findFirst: jest.fn() },
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows a SUPER_ADMIN to create a user', async () => {
    prisma.brandAccess.findFirst.mockResolvedValueOnce({
      roleId: 'r1',
      role: { name: 'SUPER_ADMIN' },
    });

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${tokenFor(CALLER.email)}`)
      .send({ email: 'writer@agrosaf.com', name: 'A Writer' });

    expect(res.status).toBe(201);
  });

  it('rejects a CONTENT_WRITER trying to create a user', async () => {
    prisma.brandAccess.findFirst.mockResolvedValueOnce({
      roleId: 'r2',
      role: { name: 'CONTENT_WRITER' },
    });

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${tokenFor(CALLER.email)}`)
      .send({ email: 'writer@agrosaf.com', name: 'A Writer' });

    expect(res.status).toBe(403);
  });

  it('rejects an unauthenticated request outright', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'writer@agrosaf.com', name: 'A Writer' });

    expect(res.status).toBe(401);
  });

  it('allows both SUPER_ADMIN and MARKETING_HEAD to read the user list', async () => {
    prisma.brandAccess.findFirst.mockResolvedValueOnce({
      roleId: 'r3',
      role: { name: 'MARKETING_HEAD' },
    });

    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tokenFor(CALLER.email)}`);

    expect(res.status).toBe(200);
  });

  it('rejects malformed body (email required) with a 400, not a 500', async () => {
    prisma.brandAccess.findFirst.mockResolvedValueOnce({
      roleId: 'r1',
      role: { name: 'SUPER_ADMIN' },
    });

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${tokenFor(CALLER.email)}`)
      .send({ name: 'Missing Email' });

    expect(res.status).toBe(400);
  });
});
