import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gallery } from './entities/gallery.entity';
import { GalleriesService } from './galleries.service';
import { GalleriesController } from './galleries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gallery])],
  controllers: [GalleriesController],
  providers: [GalleriesService],
})
export class GalleriesModule {}
