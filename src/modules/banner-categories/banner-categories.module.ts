import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerCategory } from './entities/banner-category.entity';
import { BannerCategoriesService } from './banner-categories.service';
import { BannerCategoriesController } from './banner-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BannerCategory])],
  controllers: [BannerCategoriesController],
  providers: [BannerCategoriesService],
  exports: [BannerCategoriesService],
})
export class BannerCategoriesModule {}
