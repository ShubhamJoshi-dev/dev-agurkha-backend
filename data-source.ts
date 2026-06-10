import { DataSource } from 'typeorm';
import { config } from 'dotenv';

import { User } from './src/modules/users/entities/user.entity';
import { Service } from './src/modules/services/entities/service.entity';
import { Modality } from './src/modules/modalities/entities/modality.entity';
import { NewsPost } from './src/modules/news/entities/news-post.entity';
import { Testimonial } from './src/modules/testimonials/entities/testimonial.entity';
import { TeamMember } from './src/modules/team/entities/team-member.entity';
import { Affiliate } from './src/modules/affiliates/entities/affiliate.entity';
import { Gallery } from './src/modules/galleries/entities/gallery.entity';
import { DownloadGroup } from './src/modules/downloads/entities/download-group.entity';
import { ContactMessage } from './src/modules/contact/entities/contact-message.entity';
import { ContentBlock } from './src/modules/content-blocks/entities/content-block.entity';
import { Page } from './src/modules/pages/entities/page.entity';
import { Setting } from './src/modules/settings/entities/setting.entity';
import { MenuItem } from './src/modules/menus/entities/menu-item.entity';
import { BannerCategory } from './src/modules/banner-categories/entities/banner-category.entity';
import { Banner } from './src/modules/banners/entities/banner.entity';
import { MediaItem } from './src/modules/media/entities/media-item.entity';

import { CreateUsersTable20260101000000 } from './src/database/migrations/20260101000000-CreateUsersTable';
import { AddSuperAdminAndIsActive20260427000000 } from './src/database/migrations/20260427000000-AddSuperAdminAndIsActive';
import { CreateCmsEntities20260607000000 } from './src/database/migrations/20260607000000-CreateCmsEntities';

config();

const dbUrl = process.env.DATABASE_URL ?? '';
const isRemote = !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');

export default new DataSource({
  type: 'postgres',
  url: dbUrl,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    Service,
    Modality,
    NewsPost,
    Testimonial,
    TeamMember,
    Affiliate,
    Gallery,
    DownloadGroup,
    ContactMessage,
    ContentBlock,
    Page,
    Setting,
    MenuItem,
    BannerCategory,
    Banner,
    MediaItem,
  ],
  migrations: [
    CreateUsersTable20260101000000,
    AddSuperAdminAndIsActive20260427000000,
    CreateCmsEntities20260607000000,
  ],
  migrationsTableName: 'migrations',
});
