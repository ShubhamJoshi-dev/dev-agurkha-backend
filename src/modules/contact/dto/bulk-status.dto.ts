import { IsArray, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContactStatus } from '../entities/contact-message.entity';

export class BulkStatusDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];

  @ApiProperty({ enum: ContactStatus })
  @IsEnum(ContactStatus)
  status: ContactStatus;
}
