import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}
