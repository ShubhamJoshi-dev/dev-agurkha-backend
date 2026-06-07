import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from '../helpers/create-app';
import { clearDatabase } from '../helpers/db-cleaner';
import { bootstrapSuperAdmin } from '../helpers/auth.helper';

/**
 * Covers: Modalities, Testimonials, Team, Affiliates, Galleries,
 *         Downloads, ContentBlocks, Pages
 */
describe('Content modules (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    await clearDatabase();
    app = await createTestApp();
    ({ accessToken: token } = await bootstrapSuperAdmin(app));
  });

  afterAll(() => closeTestApp(app));

  // ── Modalities ──────────────────────────────────────────────────────────
  describe('Modalities', () => {
    const payload = { slug: 'yoga', number: '01', title: 'Yoga', description: 'Yoga therapy', outcomes: ['Flexibility'] };
    let id: string;

    it('POST → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/modalities')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);
      id = res.body.id;
    });

    it('GET list → 1 item (public)', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/modalities').expect(200);
      expect(res.body.total).toBe(1);
    });

    it('GET by slug → 200 (public)', () =>
      request(app.getHttpServer()).get('/api/v1/modalities/slug/yoga').expect(200));

    it('PATCH → 200', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/modalities/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Yoga Therapy' })
        .expect(200);
      expect(res.body.title).toBe('Yoga Therapy');
    });

    it('DELETE → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/modalities/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });

  // ── Testimonials ────────────────────────────────────────────────────────
  describe('Testimonials', () => {
    const payload = { quote: 'Amazing service!', name: 'Jane', role: 'Patient', company: 'Acme' };
    let id: string;

    it('POST → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/testimonials')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);
      id = res.body.id;
    });

    it('GET list → public, 1 item', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/testimonials').expect(200);
      expect(res.body.total).toBe(1);
    });

    it('DELETE → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/testimonials/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });

  // ── Team ────────────────────────────────────────────────────────────────
  describe('Team', () => {
    const payload = { name: 'Dr. Smith', role: 'Physiotherapist', bio: 'Expert in sports injuries' };
    let id: string;

    it('POST → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/team')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);
      id = res.body.id;
    });

    it('GET :id → 200 (public)', () =>
      request(app.getHttpServer()).get(`/api/v1/team/${id}`).expect(200));

    it('DELETE → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/team/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });

  // ── Affiliates ──────────────────────────────────────────────────────────
  describe('Affiliates', () => {
    let id: string;

    it('POST → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/affiliates')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Acme Corp', websiteUrl: 'https://acme.com' })
        .expect(201);
      id = res.body.id;
    });

    it('GET list → 1 item (public)', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/affiliates').expect(200);
      expect(res.body.total).toBe(1);
    });

    it('DELETE → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/affiliates/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });

  // ── Galleries ───────────────────────────────────────────────────────────
  describe('Galleries', () => {
    const payload = {
      title: 'Summer 2026',
      slug: 'summer-2026',
      images: [{ url: 'https://example.com/img1.jpg', caption: 'First' }],
    };
    let id: string;

    it('POST → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/galleries')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);
      id = res.body.id;
      expect(res.body.images).toHaveLength(1);
    });

    it('GET by slug → 200 (public)', () =>
      request(app.getHttpServer()).get('/api/v1/galleries/slug/summer-2026').expect(200));

    it('DELETE → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/galleries/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });

  // ── Downloads ───────────────────────────────────────────────────────────
  describe('Downloads', () => {
    const payload = {
      title: 'Brochures',
      description: 'Our brochures',
      files: [{ label: 'Main Brochure', url: 'https://example.com/brochure.pdf', size: '2MB' }],
    };
    let id: string;

    it('POST → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/downloads')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);
      id = res.body.id;
      expect(res.body.files).toHaveLength(1);
    });

    it('GET :id → 200 (public)', () =>
      request(app.getHttpServer()).get(`/api/v1/downloads/${id}`).expect(200));

    it('DELETE → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/downloads/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });

  // ── ContentBlocks ───────────────────────────────────────────────────────
  describe('ContentBlocks', () => {
    let id: string;

    it('POST → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/content-blocks')
        .set('Authorization', `Bearer ${token}`)
        .send({ key: 'hero-text', title: 'Hero', body: 'Welcome to Agurkha' })
        .expect(201);
      id = res.body.id;
    });

    it('GET by key → 200 (public)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/content-blocks/key/hero-text')
        .expect(200);
      expect(res.body.body).toBe('Welcome to Agurkha');
    });

    it('GET by key → 404 unknown', () =>
      request(app.getHttpServer()).get('/api/v1/content-blocks/key/nonexistent').expect(404));

    it('DELETE → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/content-blocks/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });

  // ── Pages ───────────────────────────────────────────────────────────────
  describe('Pages', () => {
    const payload = { slug: 'about', title: 'About Us', body: '<p>About</p>', status: 'published', locale: 'en' };
    let id: string;

    it('POST → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/pages')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);
      id = res.body.id;
    });

    it('GET by slug → 200 (public)', () =>
      request(app.getHttpServer()).get('/api/v1/pages/slug/about').expect(200));

    it('GET list with status filter → 1', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/pages?status=published')
        .expect(200);
      expect(res.body.total).toBe(1);
    });

    it('DELETE → 204', () =>
      request(app.getHttpServer())
        .delete(`/api/v1/pages/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204));
  });
});
