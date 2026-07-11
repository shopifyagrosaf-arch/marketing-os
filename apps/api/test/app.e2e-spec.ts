import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

// Required env vars are set in test/jest-e2e.setup.ts (via Jest's
// `setupFiles`, which runs before this file is even imported) — NOT here,
// because ConfigModule.forRoot() reads process.env as soon as app.module.ts
// is imported, which happens before any of this file's own top-level code.

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // No live Postgres in the test environment — every route exercised
      // here either needs no DB (health) or fails before reaching it (auth).
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
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

  it('GET /health is public and returns ok without a token', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /organizations/me is rejected without a token', async () => {
    const res = await request(app.getHttpServer()).get('/organizations/me');
    expect(res.status).toBe(401);
  });

  it('GET /brands rejects unauthenticated requests', async () => {
    const res = await request(app.getHttpServer()).get('/brands/mine');
    expect(res.status).toBe(401);
  });
});
