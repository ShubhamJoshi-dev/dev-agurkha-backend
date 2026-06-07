import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

export const TEST_DB_URL =
  'postgresql://postgres:password@localhost:5435/agurkha_test';
export const TEST_JWT_SECRET = 'e2e-test-jwt-secret-1234567890';
export const TEST_SETUP_SECRET = 'e2e-setup-secret';

/**
 * Sets env vars BEFORE AppModule is imported so ConfigModule picks them up.
 * Call this once per test file at the module level (outside describe).
 */
export function setTestEnv() {
  process.env.DATABASE_URL = TEST_DB_URL;
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
  process.env.SETUP_SECRET = TEST_SETUP_SECRET;
  process.env.CORS_ORIGIN = '*';
  // Keep the pool small so 8 sequential apps don't exhaust postgres connections
  process.env.DB_POOL_MAX = '3';
}

/** Close the app and wait for the connection pool to fully drain. */
export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
  // Give pg a moment to release the pool before the next test file opens one
  await new Promise((r) => setTimeout(r, 300));
}

export async function createTestApp(): Promise<INestApplication> {
  setTestEnv();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  return app;
}
