import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  } from 'class-validator';
import { IsUrlOrPath } from '../../../common/validators/is-url-or-path.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublishStatus } from '../entities/news-post.entity';

export class CreateNewsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: '2026-06-07' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrlOrPath()
  imageUrl?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ enum: PublishStatus, default: PublishStatus.DRAFT })
  @IsEnum(PublishStatus)
  status: PublishStatus;

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
  @IsUrlOrPath()
  seoOgImage?: string;
}
