import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from '../helpers/create-app';
import { clearDatabase } from '../helpers/db-cleaner';
import { bootstrapSuperAdmin } from '../helpers/auth.helper';

describe('Menus & Banners (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    await clearDatabase();
    app = await createTestApp();
    ({ accessToken: token } = await bootstrapSuperAdmin(app));
  });

  afterAll(() => closeTestApp(app));

  // ── Menus ───────────────────────────────────────────────────────────────
  describe('Menus', () => {
    let itemId: string;

    it('POST → 201 creates header menu item', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/menus')
        .set('Authorization', `Bearer ${token}`)
        .send({ location: 'header', label: 'Home', linkType: 'url', linkValue: '/', sortOrder: 0 })
        .expect(201);
      itemId = res.body.id;
    });

    it('GET /api/v1/menus?location=header → public list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/menus?location=header')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].label).toBe('Home');
    });

    it('PATCH /api/v1/menus/reorder → 204', () =>
      request(app.getHttpServer())
        .patch('/api/v1/menus/reorder')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ id: itemId, sortOrder: 10 }] })
        .expect(204));

    it('DELETE → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/menus/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });

  // ── Banner Categories ───────────────────────────────────────────────────
  describe('Banner Categories', () => {
    let catId: string;

    it('POST → 201 (admin)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/banner-categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hero Banners', slug: 'hero' })
        .expect(201);
      catId = res.body.id;
    });

    it('GET list → 1 item', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/banner-categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.total).toBe(1);
    });

    // ── Banners ─────────────────────────────────────────────────────────
    describe('Banners', () => {
      let bannerId: string;

      it('POST → 201', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/v1/banners')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: 'Summer Sale',
            body: 'Get 20% off',
            categoryId: catId,
            locale: 'en',
            isActive: true,
            sortOrder: 1,
          })
          .expect(201);
        bannerId = res.body.id;
      });

      it('GET list → 1 banner', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/v1/banners')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        expect(res.body.total).toBe(1);
      });

      it('PATCH → 200 deactivates banner', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/api/v1/banners/${bannerId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ isActive: false })
          .expect(200);
        expect(res.body.isActive).toBe(false);
      });

      it('DELETE → 204', () =>
        request(app.getHttpServer())
          .delete(`/api/v1/banners/${bannerId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204));
    });

    it('DELETE banner category → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/banner-categories/${catId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });

  // ── Analytics ───────────────────────────────────────────────────────────
  describe('Analytics', () => {
    it('GET /api/v1/analytics/summary → 200 with expected shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('pageViews');
      expect(res.body.pageViews).toHaveProperty('total');
      expect(res.body.pageViews).toHaveProperty('byDay');
      expect(Array.isArray(res.body.messagesByMonth)).toBe(true);
    });

    it('GET /api/v1/analytics/summary → 401 without token', () =>
      request(app.getHttpServer()).get('/api/v1/analytics/summary').expect(401));
  });
});
