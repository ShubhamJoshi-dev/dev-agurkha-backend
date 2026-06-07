import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { MenuLocation } from '../entities/menu-item.entity';

export class MenuQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: MenuLocation })
  @IsOptional()
  @IsEnum(MenuLocation)
  location?: MenuLocation;
}
