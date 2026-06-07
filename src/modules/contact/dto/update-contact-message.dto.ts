import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContactStatus } from '../entities/contact-message.entity';

export class UpdateContactMessageDto {
  @ApiProperty({ enum: ContactStatus })
  @IsEnum(ContactStatus)
  status: ContactStatus;
}
