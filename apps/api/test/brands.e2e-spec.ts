import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

// Required env vars are set in test/jest-e2e.setup.ts (via Jest's
// `setupFiles`) — see app.e2e-spec.ts for why that matters.

const ACTIVE_USER = {
  id: 'u1',
  email: 'writer@agrosaf.com',
  name: 'A Writer',
  organizationId: 'org1',
  status: 'ACTIVE',
};

function tokenFor(email: string) {
  return jwt.sign({ sub: email, email, name: 'Test User' }, process.env.AUTH_SECRET as string, {
    algorithm: 'HS256',
    expiresIn: '5m',
  });
}

/**
 * Exercises the full brand-scoped RBAC chain end-to-end: JwtAuthGuard ->
 * BrandAccessGuard (resolves brand from x-brand-id + attaches role) ->
 * RolesGuard (checks @Roles). Unit tests cover each guard in isolation
 * (see src/common/guards/*.spec.ts); this proves they compose correctly
 * on a real route.
 */
describe('Brands (e2e) — RBAC chain', () => {
  let app: INestApplication;
  let prisma: {
    user: { findUnique: jest.Mock };
    brand: { findFirst: jest.Mock; findUniqueOrThrow: jest.Mock; update: jest.Mock };
    brandAccess: { findFirst: jest.Mock };
    auditLog: { create: jest.Mock };
  };

  beforeAll(async () => {
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(ACTIVE_USER) },
      brand: {
        findFirst: jest.fn().mockResolvedValue({ id: 'brand1', organizationId: 'org1' }),
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue({ id: 'brand1', name: 'Old Name', localeDefault: 'en' }),
        update: jest
          .fn()
          .mockResolvedValue({ id: 'brand1', name: 'New Name', localeDefault: 'en' }),
      },
      brandAccess: { findFirst: jest.fn() },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
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

  it('allows a BRAND_MANAGER to update their brand', async () => {
    prisma.brandAccess.findFirst.mockResolvedValueOnce({
      roleId: 'r1',
      role: { name: 'BRAND_MANAGER' },
    });

    const res = await request(app.getHttpServer())
      .patch('/brands/mine')
      .set('Authorization', `Bearer ${tokenFor(ACTIVE_USER.email)}`)
      .set('x-brand-id', 'brand1')
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('rejects a CONTENT_WRITER (wrong role for this action)', async () => {
    prisma.brandAccess.findFirst.mockResolvedValueOnce({
      roleId: 'r2',
      role: { name: 'CONTENT_WRITER' },
    });

    const res = await request(app.getHttpServer())
      .patch('/brands/mine')
      .set('Authorization', `Bearer ${tokenFor(ACTIVE_USER.email)}`)
      .set('x-brand-id', 'brand1')
      .send({ name: 'New Name' });

    expect(res.status).toBe(403);
  });

  it('rejects when x-brand-id header is missing', async () => {
    const res = await request(app.getHttpServer())
      .patch('/brands/mine')
      .set('Authorization', `Bearer ${tokenFor(ACTIVE_USER.email)}`)
      .send({ name: 'New Name' });

    expect(res.status).toBe(400);
  });

  it('rejects an unauthenticated request outright', async () => {
    const res = await request(app.getHttpServer())
      .patch('/brands/mine')
      .set('x-brand-id', 'brand1')
      .send({ name: 'New Name' });

    expect(res.status).toBe(401);
  });
});
