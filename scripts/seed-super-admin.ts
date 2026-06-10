/**
 * One-time script to seed the first SUPER_ADMIN.
 * Usage:  npx ts-node scripts/seed-super-admin.ts
 * Safe to re-run — skips if a super admin already exists.
 */
import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const EMAIL = process.env.ADMIN_EMAIL ?? 'info@agurkha.com';
const NAME  = process.env.ADMIN_NAME  ?? 'Super Admin';
const PASS  = process.env.ADMIN_PASSWORD ?? 'Applied@1234';

const dbUrl = process.env.DATABASE_URL ?? '';
const isRemote = !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    url: dbUrl,
    ssl: isRemote ? { rejectUnauthorized: false } : false,
  });

  await ds.initialize();
  console.log('✅ Connected to database');

  const existing = await ds.query(
    `SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1`,
  );

  if (existing.length > 0) {
    console.log('⚠️  A SUPER_ADMIN already exists — skipping seed.');
    await ds.destroy();
    return;
  }

  const hashed = await bcrypt.hash(PASS, 12);

  await ds.query(
    `INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
     VALUES (uuid_generate_v4(), $1, $2, $3, 'SUPER_ADMIN', true, now(), now())`,
    [EMAIL, NAME, hashed],
  );

  console.log(`✅ SUPER_ADMIN created:`);
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASS}`);

  await ds.destroy();
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
