import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PageStatus } from '../entities/page.entity';

export class CreatePageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ default: 'default' })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  featuredImageUrl?: string;

  @ApiProperty({ enum: PageStatus, default: PageStatus.DRAFT })
  @IsEnum(PageStatus)
  status: PageStatus;

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  seoOgImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishAt?: string;
}
