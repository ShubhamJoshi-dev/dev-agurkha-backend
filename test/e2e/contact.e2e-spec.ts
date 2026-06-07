import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from '../helpers/create-app';
import { clearDatabase } from '../helpers/db-cleaner';
import { bootstrapSuperAdmin } from '../helpers/auth.helper';

describe('Contact (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let msgId: string;

  const submission = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Inquiry',
    message: 'I would like to know more about your services.',
  };

  beforeAll(async () => {
    await clearDatabase();
    app = await createTestApp();
    ({ accessToken: token } = await bootstrapSuperAdmin(app));
  });

  afterAll(() => closeTestApp(app));

  // ── Public submit ──────────────────────────────────────────────────────
  describe('POST /api/v1/contact', () => {
    it('submits successfully → { ok: true }', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/contact')
        .send(submission)
        .expect(201);
      expect(res.body.ok).toBe(true);
    });

    it('rejects missing required field (400)', () =>
      request(app.getHttpServer())
        .post('/api/v1/contact')
        .send({ name: 'X', email: 'bad@test.com' })
        .expect(400));

    it('rejects invalid email (400)', () =>
      request(app.getHttpServer())
        .post('/api/v1/contact')
        .send({ ...submission, email: 'not-an-email' })
        .expect(400));
  });

  // ── Admin inbox ────────────────────────────────────────────────────────
  describe('GET /api/v1/contact-messages', () => {
    it('returns paginated list (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/contact-messages')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.total).toBeGreaterThan(0);
      msgId = res.body.data[0].id;
      expect(res.body.data[0].status).toBe('new');
    });

    it('rejects unauthenticated (401)', () =>
      request(app.getHttpServer()).get('/api/v1/contact-messages').expect(401));

    it('filters by status=read → empty initially', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/contact-messages?status=read')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.total).toBe(0);
    });
  });

  describe('PATCH /api/v1/contact-messages/:id', () => {
    it('updates status to read', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/contact-messages/${msgId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'read' })
        .expect(200);
      expect(res.body.status).toBe('read');
    });
  });

  describe('POST /api/v1/contact-messages/bulk-status', () => {
    it('bulk-updates status to archived', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/contact-messages/bulk-status')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [msgId], status: 'archived' })
        .expect(204);

      const res = await request(app.getHttpServer())
        .get('/api/v1/contact-messages?status=archived')
        .set('Authorization', `Bearer ${token}`);
      expect(res.body.total).toBe(1);
    });
  });

  describe('DELETE /api/v1/contact-messages/:id', () => {
    it('deletes the message → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/contact-messages/${msgId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));

    it('404 after delete', () =>
      request(app.getHttpServer())
        .patch(`/api/v1/contact-messages/${msgId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'new' })
        .expect(404));
  });
});
