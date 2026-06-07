import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable20260101000000 implements MigrationInterface {
  name = 'CreateUsersTable20260101000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum (safe on fresh DB AND on existing DB with old enum)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER', 'SUPER_ADMIN');
      EXCEPTION WHEN duplicate_object THEN
        -- enum already exists (dev DB); add SUPER_ADMIN if missing
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'users_role_enum' AND e.enumlabel = 'SUPER_ADMIN'
        ) THEN
          ALTER TYPE "public"."users_role_enum" ADD VALUE 'SUPER_ADMIN';
        END IF;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'USER',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
