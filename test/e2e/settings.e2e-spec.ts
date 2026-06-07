import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from '../helpers/create-app';
import { clearDatabase } from '../helpers/db-cleaner';
import { bootstrapSuperAdmin } from '../helpers/auth.helper';

describe('Settings (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    await clearDatabase();
    app = await createTestApp();
    ({ accessToken: token } = await bootstrapSuperAdmin(app));
  });

  afterAll(() => closeTestApp(app));

  it('GET /api/v1/settings/general → 200 empty object (public)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/settings/general')
      .expect(200);
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/v1/settings/homepage → 200 (public)', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/settings/homepage')
      .expect(200);
  });

  it('PATCH /api/v1/settings/general → 200 persists data', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/v1/settings/general')
      .set('Authorization', `Bearer ${token}`)
      .send({ siteName: 'Agurkha', phone: '+9771234567' })
      .expect(200);
    expect(res.body.siteName).toBe('Agurkha');
    expect(res.body.phone).toBe('+9771234567');
  });

  it('GET /api/v1/settings/general → reads back the saved values', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/settings/general')
      .expect(200);
    expect(res.body.siteName).toBe('Agurkha');
  });

  it('PATCH /api/v1/settings/homepage → 200 persists data', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/v1/settings/homepage')
      .set('Authorization', `Bearer ${token}`)
      .send({ heroTitle: 'Welcome', showTestimonials: true })
      .expect(200);
    expect(res.body.heroTitle).toBe('Welcome');
  });

  it('PATCH /api/v1/settings/general → 401 without token', () =>
    request(app.getHttpServer())
      .patch('/api/v1/settings/general')
      .send({ siteName: 'Hacked' })
      .expect(401));
});
