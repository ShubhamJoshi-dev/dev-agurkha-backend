import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DownloadFileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  size?: string;
}

export class CreateDownloadGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: [DownloadFileDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DownloadFileDto)
  files: DownloadFileDto[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
