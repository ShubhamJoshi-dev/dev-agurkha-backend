import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadGroup } from './entities/download-group.entity';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DownloadGroup])],
  controllers: [DownloadsController],
  providers: [DownloadsService],
})
export class DownloadsModule {}
