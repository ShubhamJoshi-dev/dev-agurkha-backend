import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCmsEntities20260607000000 implements MigrationInterface {
  name = 'CreateCmsEntities20260607000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "shortDescription" text NOT NULL,
        "fullDescription" text NOT NULL,
        "features" jsonb NOT NULL DEFAULT '[]',
        "imageUrl" character varying,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_services_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_services" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "modalities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "number" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "outcomes" jsonb NOT NULL DEFAULT '[]',
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_modalities_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_modalities" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "news_posts_status_enum" AS ENUM('draft', 'published');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE "news_posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "excerpt" text NOT NULL,
        "content" text NOT NULL,
        "date" date NOT NULL,
        "imageUrl" character varying,
        "category" character varying NOT NULL,
        "status" "news_posts_status_enum" NOT NULL DEFAULT 'draft',
        "locale" character varying NOT NULL DEFAULT 'en',
        "seoTitle" character varying,
        "seoDescription" text,
        "seoOgImage" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_news_posts_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_news_posts" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "testimonials" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quote" text NOT NULL,
        "name" character varying NOT NULL,
        "role" character varying NOT NULL,
        "company" character varying NOT NULL,
        "avatarUrl" character varying,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_testimonials" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "team_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "role" character varying NOT NULL,
        "bio" text NOT NULL,
        "imageUrl" character varying,
        "linkedinUrl" character varying,
        "whatsappUrl" character varying,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_team_members" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "affiliates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "logoUrl" character varying,
        "websiteUrl" character varying,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_affiliates" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "galleries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "coverImageUrl" character varying,
        "description" text,
        "images" jsonb NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_galleries_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_galleries" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "download_groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "files" jsonb NOT NULL DEFAULT '[]',
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_download_groups" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "contact_messages_status_enum" AS ENUM('new', 'read', 'archived');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE "contact_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "subject" character varying NOT NULL,
        "message" text NOT NULL,
        "status" "contact_messages_status_enum" NOT NULL DEFAULT 'new',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contact_messages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "content_blocks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying NOT NULL,
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_content_blocks_key" UNIQUE ("key"),
        CONSTRAINT "PK_content_blocks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "pages_status_enum" AS ENUM('draft', 'published');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE "pages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "template" character varying NOT NULL DEFAULT 'default',
        "body" text NOT NULL,
        "featuredImageUrl" character varying,
        "status" "pages_status_enum" NOT NULL DEFAULT 'draft',
        "locale" character varying NOT NULL DEFAULT 'en',
        "seoTitle" character varying,
        "seoDescription" text,
        "seoKeywords" character varying,
        "seoOgImage" character varying,
        "publishAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_pages_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_pages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying NOT NULL,
        "value" jsonb NOT NULL DEFAULT '{}',
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_settings_key" UNIQUE ("key"),
        CONSTRAINT "PK_settings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "menu_items_location_enum" AS ENUM('header', 'footer');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE "menu_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "location" "menu_items_location_enum" NOT NULL,
        "parentId" uuid,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "label" character varying NOT NULL,
        "linkType" character varying NOT NULL,
        "linkValue" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_items" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "banner_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "seoTitle" character varying,
        "seoDescription" text,
        "seoOgImage" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_banner_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_banner_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "banners" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "imageUrl" character varying,
        "ctaLabel" character varying,
        "ctaUrl" character varying,
        "categoryId" uuid NOT NULL,
        "locale" character varying NOT NULL DEFAULT 'en',
        "publishFrom" TIMESTAMP,
        "publishTo" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_banners" PRIMARY KEY ("id"),
        CONSTRAINT "FK_banners_category" FOREIGN KEY ("categoryId")
          REFERENCES "banner_categories"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "media_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "filename" character varying NOT NULL,
        "originalName" character varying NOT NULL,
        "mimeType" character varying NOT NULL,
        "size" bigint NOT NULL,
        "url" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media_items" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "media_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "banners"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "banner_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_items"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "menu_items_location_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pages"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "pages_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "content_blocks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_messages"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "contact_messages_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "download_groups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "galleries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "affiliates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "team_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "testimonials"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news_posts"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "news_posts_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "modalities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "services"`);
  }
}
