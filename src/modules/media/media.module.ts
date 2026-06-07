import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaItem } from './entities/media-item.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MediaItem])],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
