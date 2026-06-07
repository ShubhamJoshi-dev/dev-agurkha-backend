import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GalleryImageDto {
  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string;
}

export class CreateGalleryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [GalleryImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GalleryImageDto)
  images: GalleryImageDto[];
}
