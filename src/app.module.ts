import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { TokenBlocklistModule } from './common/blocklist/token-blocklist.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Existing modules
import { UsersModule } from './modules/users/users.module';
import { AdminsModule } from './modules/admins/admins.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';

// CMS modules
import { ServicesModule } from './modules/services/services.module';
import { ModalitiesModule } from './modules/modalities/modalities.module';
import { NewsModule } from './modules/news/news.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { TeamModule } from './modules/team/team.module';
import { AffiliatesModule } from './modules/affiliates/affiliates.module';
import { GalleriesModule } from './modules/galleries/galleries.module';
import { DownloadsModule } from './modules/downloads/downloads.module';
import { ContactModule } from './modules/contact/contact.module';
import { ContentBlocksModule } from './modules/content-blocks/content-blocks.module';
import { PagesModule } from './modules/pages/pages.module';
import { SettingsModule } from './modules/settings/settings.module';
import { MenusModule } from './modules/menus/menus.module';
import { BannersModule } from './modules/banners/banners.module';
import { BannerCategoriesModule } from './modules/banner-categories/banner-categories.module';
import { MediaModule } from './modules/media/media.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    DatabaseModule,
    TokenBlocklistModule,

    // Auth & users
    UsersModule,
    AdminsModule,
    AuthModule,
    HealthModule,

    // CMS content
    ServicesModule,
    ModalitiesModule,
    NewsModule,
    TestimonialsModule,
    TeamModule,
    AffiliatesModule,
    GalleriesModule,
    DownloadsModule,
    ContactModule,
    ContentBlocksModule,
    PagesModule,
    SettingsModule,
    MenusModule,
    BannerCategoriesModule,
    BannersModule,
    MediaModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
