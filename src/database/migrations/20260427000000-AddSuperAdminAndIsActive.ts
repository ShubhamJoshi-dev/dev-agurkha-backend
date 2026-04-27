import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuperAdminAndIsActive20260427000000 implements MigrationInterface {
  name = 'AddSuperAdminAndIsActive20260427000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL requires a commit before adding a new enum value
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'`,
    );

    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);

    // PostgreSQL does not support removing enum values directly.
    // To fully revert, recreate the enum without SUPER_ADMIN.
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE varchar USING "role"::text`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM('ADMIN', 'USER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "users_role_enum" USING "role"::"users_role_enum"`,
    );
  }
}
