import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { ContentRequestStatus } from '@prisma/client';
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
 * Exercises the brand-scoped RBAC chain for /content-requests end-to-end:
 * JwtAuthGuard -> BrandAccessGuard (resolves brand from x-brand-id +
 * attaches role) -> the controller/service, unlike /brands/mine there is no
 * RolesGuard/@Roles on top — any role with brand access may create/list/
 * transition, matching ContentRequestsController's doc comment.
 */
describe('Content Requests (e2e) — RBAC chain', () => {
  let app: INestApplication;
  let prisma: {
    user: { findUnique: jest.Mock };
    brand: { findFirst: jest.Mock };
    brandAccess: { findFirst: jest.Mock };
    contentRequest: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    auditLog: { create: jest.Mock };
  };

  beforeAll(async () => {
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(ACTIVE_USER) },
      brand: {
        findFirst: jest.fn().mockResolvedValue({ id: 'brand1', organizationId: 'org1' }),
      },
      brandAccess: { findFirst: jest.fn() },
      contentRequest: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
      },
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

  it('allows any brand-accessing role to create a content request', async () => {
    prisma.brandAccess.findFirst.mockResolvedValueOnce({
      roleId: 'r1',
      role: { name: 'CONTENT_WRITER' },
    });
    prisma.contentRequest.create.mockResolvedValueOnce({
      id: 'cr1',
      title: 'New landing page copy',
      status: ContentRequestStatus.DRAFT,
    });

    const res = await request(app.getHttpServer())
      .post('/content-requests')
      .set('Authorization', `Bearer ${tokenFor(ACTIVE_USER.email)}`)
      .set('x-brand-id', 'brand1')
      .send({ title: 'New landing page copy', contentType: 'website_copy' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('DRAFT');
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('rejects when x-brand-id header is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/content-requests')
      .set('Authorization', `Bearer ${tokenFor(ACTIVE_USER.email)}`)
      .send({ title: 'New landing page copy', contentType: 'website_copy' });

    expect(res.status).toBe(400);
  });

  it('rejects an unauthenticated request outright', async () => {
    const res = await request(app.getHttpServer())
      .get('/content-requests')
      .set('x-brand-id', 'brand1');

    expect(res.status).toBe(401);
  });

  it('rejects a user with no BrandAccess row for the brand at all', async () => {
    prisma.brandAccess.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const res = await request(app.getHttpServer())
      .get('/content-requests')
      .set('Authorization', `Bearer ${tokenFor(ACTIVE_USER.email)}`)
      .set('x-brand-id', 'brand1');

    expect(res.status).toBe(403);
  });

  it('rejects an invalid status transition with 400', async () => {
    prisma.brandAccess.findFirst.mockResolvedValueOnce({
      roleId: 'r1',
      role: { name: 'CONTENT_WRITER' },
    });
    prisma.contentRequest.findFirst.mockResolvedValueOnce({
      id: 'cr1',
      requestedById: ACTIVE_USER.id,
      status: ContentRequestStatus.CANCELLED,
    });

    const res = await request(app.getHttpServer())
      .patch('/content-requests/cr1/status')
      .set('Authorization', `Bearer ${tokenFor(ACTIVE_USER.email)}`)
      .set('x-brand-id', 'brand1')
      .send({ status: 'SUBMITTED' });

    expect(res.status).toBe(400);
  });
});
