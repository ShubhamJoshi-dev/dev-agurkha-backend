import { DataSource } from 'typeorm';
import { TEST_DB_URL } from './create-app';

/**
 * Opens a direct connection to the test DB and truncates all CMS tables,
 * preserving the migrations table. Call in beforeEach / beforeAll as needed.
 */
export async function clearDatabase(): Promise<void> {
  const ds = new DataSource({ type: 'postgres', url: TEST_DB_URL });
  await ds.initialize();

  await ds.query(`
    TRUNCATE TABLE
      banners,
      banner_categories,
      menu_items,
      settings,
      pages,
      content_blocks,
      contact_messages,
      download_groups,
      galleries,
      affiliates,
      team_members,
      testimonials,
      news_posts,
      modalities,
      services,
      media_items,
      users
    RESTART IDENTITY CASCADE
  `);

  await ds.destroy();
}
