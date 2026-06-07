import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from '../helpers/create-app';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /api/v1/health → database is up (memory may spike during tests)', async () => {
    // Health returns 503 when any single check fails.
    // During e2e runs multiple NestJS instances share the same heap, so the
    // memory_heap threshold can be exceeded.  We only care that the database
    // connection is healthy.
    //
    // When 200 → body = { status, info, error, details }
    // When 503 → the global HttpExceptionFilter wraps it:
    //            body = { statusCode, message: { status, info, error, details }, ... }
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect([200, 503]).toContain(res.status);

    const health = res.status === 200 ? res.body : (res.body.message ?? {});
    const dbStatus =
      health?.info?.database?.status ?? health?.details?.database?.status;
    expect(dbStatus).toBe('up');
  });
});
