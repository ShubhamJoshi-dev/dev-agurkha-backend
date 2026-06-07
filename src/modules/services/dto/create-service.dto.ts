import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
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
  shortDescription: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullDescription: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
