import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TEST_SETUP_SECRET } from './create-app';

export interface AuthTokens {
  accessToken: string;
  userId: string;
}

/**
 * Creates the initial super-admin via the /auth/setup endpoint and logs in.
 */
export async function bootstrapSuperAdmin(
  app: INestApplication,
  credentials = { email: 'superadmin@test.com', name: 'Super Admin', password: 'Password123!' },
): Promise<AuthTokens> {
  await request(app.getHttpServer())
    .post('/api/v1/auth/setup')
    .send({ ...credentials, setupSecret: TEST_SETUP_SECRET });

  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: credentials.email, password: credentials.password })
    .expect(200);

  return {
    accessToken: res.body.accessToken,
    userId: res.body.user.id,
  };
}

/**
 * Creates a regular user via the /auth/register endpoint and logs in.
 */
export async function bootstrapUser(
  app: INestApplication,
  credentials = { email: 'user@test.com', name: 'Test User', password: 'Password123!' },
): Promise<AuthTokens> {
  await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send(credentials);

  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: credentials.email, password: credentials.password })
    .expect(200);

  return {
    accessToken: res.body.accessToken,
    userId: res.body.user.id,
  };
}
