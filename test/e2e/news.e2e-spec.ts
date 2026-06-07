import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from '../helpers/create-app';
import { clearDatabase } from '../helpers/db-cleaner';
import { bootstrapSuperAdmin } from '../helpers/auth.helper';

describe('News (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let postId: string;

  const payload = {
    slug: 'first-post',
    title: 'First Post',
    excerpt: 'Short excerpt',
    content: 'Full content body',
    date: '2026-06-07',
    category: 'General',
    status: 'draft',
    locale: 'en',
  };

  beforeAll(async () => {
    await clearDatabase();
    app = await createTestApp();
    ({ accessToken: token } = await bootstrapSuperAdmin(app));
  });

  afterAll(() => closeTestApp(app));

  it('GET /api/v1/news → 200 empty list (public)', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/news').expect(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('POST /api/v1/news → 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/news')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);
    postId = res.body.id;
    expect(res.body.status).toBe('draft');
  });

  it('GET /api/v1/news → returns draft post', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/news').expect(200);
    expect(res.body.total).toBe(1);
  });

  it('GET /api/v1/news?status=published → empty (post is draft)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/news?status=published')
      .expect(200);
    expect(res.body.total).toBe(0);
  });

  it('GET /api/v1/news?status=draft → returns post', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/news?status=draft')
      .expect(200);
    expect(res.body.total).toBe(1);
  });

  it('GET /api/v1/news/slug/:slug → 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/news/slug/first-post')
      .expect(200);
    expect(res.body.slug).toBe('first-post');
  });

  it('PATCH /api/v1/news/:id → publishes the post', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/news/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'published' })
      .expect(200);
    expect(res.body.status).toBe('published');
  });

  it('GET /api/v1/news?status=published → now returns 1', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/news?status=published')
      .expect(200);
    expect(res.body.total).toBe(1);
  });

  it('DELETE /api/v1/news/:id → 204', () =>
    request(app.getHttpServer())
      .delete(`/api/v1/news/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204));
});
