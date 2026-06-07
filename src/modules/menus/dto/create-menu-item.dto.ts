import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuLocation } from '../entities/menu-item.entity';

export class CreateMenuItemDto {
  @ApiProperty({ enum: MenuLocation })
  @IsEnum(MenuLocation)
  location: MenuLocation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  parentId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'page | url | news | service | modality' })
  @IsString()
  @IsNotEmpty()
  linkType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  linkValue: string;
}
