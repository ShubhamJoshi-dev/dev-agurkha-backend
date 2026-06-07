import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from '../helpers/create-app';
import { clearDatabase } from '../helpers/db-cleaner';
import { bootstrapSuperAdmin } from '../helpers/auth.helper';

describe('Services (e2e)', () => {
  let app: INestApplication;
  let token: string;

  const payload = {
    slug: 'physiotherapy',
    title: 'Physiotherapy',
    shortDescription: 'Short desc',
    fullDescription: 'Full description here',
    features: ['Feature A', 'Feature B'],
    sortOrder: 1,
  };

  beforeAll(async () => {
    await clearDatabase();
    app = await createTestApp();
    ({ accessToken: token } = await bootstrapSuperAdmin(app));
  });

  afterAll(() => closeTestApp(app));

  let serviceId: string;

  it('GET /api/v1/services → 200 empty list', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/services').expect(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('POST /api/v1/services → 201 (admin)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);
    serviceId = res.body.id;
    expect(res.body.slug).toBe(payload.slug);
    expect(res.body.features).toEqual(payload.features);
  });

  it('POST /api/v1/services → 401 without token', () =>
    request(app.getHttpServer()).post('/api/v1/services').send(payload).expect(401));

  it('POST /api/v1/services → 409 duplicate slug', () =>
    request(app.getHttpServer())
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(409));

  it('GET /api/v1/services → 200 with 1 item', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/services').expect(200);
    expect(res.body.total).toBe(1);
  });

  it('GET /api/v1/services?search=physio → returns match', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/services?search=physio')
      .expect(200);
    expect(res.body.data[0].slug).toBe('physiotherapy');
  });

  it('GET /api/v1/services?search=noresult → empty', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/services?search=xyznotfound')
      .expect(200);
    expect(res.body.total).toBe(0);
  });

  it('GET /api/v1/services/:id → 200', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/services/${serviceId}`)
      .expect(200);
    expect(res.body.id).toBe(serviceId);
  });

  it('GET /api/v1/services/slug/:slug → 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/services/slug/physiotherapy')
      .expect(200);
    expect(res.body.slug).toBe('physiotherapy');
  });

  it('GET /api/v1/services/slug/:slug → 404 unknown slug', () =>
    request(app.getHttpServer()).get('/api/v1/services/slug/unknown').expect(404));

  it('PATCH /api/v1/services/:id → 200 updates title', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/services/${serviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Physio' })
      .expect(200);
    expect(res.body.title).toBe('Updated Physio');
  });

  it('POST /api/v1/services/bulk-delete → 204', async () => {
    // Create a second service to bulk-delete
    const res = await request(app.getHttpServer())
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...payload, slug: 'to-delete' });
    const id2 = res.body.id;

    await request(app.getHttpServer())
      .post('/api/v1/services/bulk-delete')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [id2] })
      .expect(204);

    const list = await request(app.getHttpServer()).get('/api/v1/services');
    expect(list.body.data.some((s: { id: string }) => s.id === id2)).toBe(false);
  });

  it('DELETE /api/v1/services/:id → 204', () =>
    request(app.getHttpServer())
      .delete(`/api/v1/services/${serviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204));

  it('GET /api/v1/services/:id → 404 after delete', () =>
    request(app.getHttpServer()).get(`/api/v1/services/${serviceId}`).expect(404));
});
