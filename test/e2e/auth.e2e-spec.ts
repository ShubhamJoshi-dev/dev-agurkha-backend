import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp, TEST_SETUP_SECRET } from '../helpers/create-app';
import { clearDatabase } from '../helpers/db-cleaner';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const superAdmin = { email: 'sa@test.com', name: 'Super Admin', password: 'Password123!' };

  beforeAll(async () => {
    await clearDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  // ── Setup ──────────────────────────────────────────────────────────────
  describe('POST /api/v1/auth/setup', () => {
    it('creates the first super-admin', () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/setup')
        .send({ ...superAdmin, setupSecret: TEST_SETUP_SECRET })
        .expect(201)
        .expect(({ body }) => {
          expect(body.email).toBe(superAdmin.email);
          expect(body.role).toBe('SUPER_ADMIN');
          expect(body.password).toBeUndefined();
        }));

    it('rejects a second call (409)', () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/setup')
        .send({ ...superAdmin, setupSecret: TEST_SETUP_SECRET })
        .expect(409));

    it('rejects wrong setup secret (401)', () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/setup')
        .send({ ...superAdmin, setupSecret: 'wrong' })
        .expect(401));
  });

  // ── Register ───────────────────────────────────────────────────────────
  describe('POST /api/v1/auth/register', () => {
    it('creates a new user', () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'user@test.com', name: 'Test User', password: 'Password123!' })
        .expect(201)
        .expect(({ body }) => {
          expect(body.email).toBe('user@test.com');
          expect(body.role).toBe('USER');
        }));

    it('rejects duplicate email (409)', () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'user@test.com', name: 'Dup', password: 'Password123!' })
        .expect(409));

    it('rejects invalid email (400)', () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', name: 'Bad', password: 'Password123!' })
        .expect(400));
  });

  // ── Login ──────────────────────────────────────────────────────────────
  describe('POST /api/v1/auth/login', () => {
    it('returns accessToken and user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: superAdmin.email, password: superAdmin.password })
        .expect(200);
      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.user.email).toBe(superAdmin.email);
    });

    it('rejects wrong password (401)', () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: superAdmin.email, password: 'wrongpassword' })
        .expect(401));
  });

  // ── Signin alias ───────────────────────────────────────────────────────
  describe('POST /api/v1/auth/signin', () => {
    it('accepts { username, password } and returns accessToken', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/signin')
        .send({ username: superAdmin.email, password: superAdmin.password })
        .expect(200);
      expect(res.body.accessToken).toBeTruthy();
    });
  });

  // ── Me ─────────────────────────────────────────────────────────────────
  describe('GET /api/v1/auth/me', () => {
    let token: string;
    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: superAdmin.email, password: superAdmin.password });
      token = res.body.accessToken;
    });

    it('returns current user', () =>
      request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(({ body }) => expect(body.email).toBe(superAdmin.email)));

    it('rejects without token (401)', () =>
      request(app.getHttpServer()).get('/api/v1/auth/me').expect(401));
  });

  // ── Logout ─────────────────────────────────────────────────────────────
  describe('POST /api/v1/auth/logout', () => {
    it('invalidates the token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: superAdmin.email, password: superAdmin.password });
      const token = loginRes.body.accessToken;

      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });

  // ── Signout alias ──────────────────────────────────────────────────────
  describe('POST /api/v1/auth/signout', () => {
    it('works as alias for logout', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: superAdmin.email, password: superAdmin.password });

      await request(app.getHttpServer())
        .post('/api/v1/auth/signout')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .expect(200);
    });
  });
});
