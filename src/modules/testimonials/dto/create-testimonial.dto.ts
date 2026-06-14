import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { IsUrlOrPath } from '../../../common/validators/is-url-or-path.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestimonialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  quote: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrlOrPath()
  avatarUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
