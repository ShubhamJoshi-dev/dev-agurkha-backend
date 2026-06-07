import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modality } from './entities/modality.entity';
import { ModalitiesService } from './modalities.service';
import { ModalitiesController } from './modalities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Modality])],
  controllers: [ModalitiesController],
  providers: [ModalitiesService],
})
export class ModalitiesModule {}
