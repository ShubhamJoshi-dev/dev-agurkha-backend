import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiNoContentResponse } from '@nestjs/swagger';
import { BannerCategoriesService } from './banner-categories.service';
import { CreateBannerCategoryDto } from './dto/create-banner-category.dto';
import { UpdateBannerCategoryDto } from './dto/update-banner-category.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Banner Categories')
@Auth(Role.ADMIN, Role.SUPER_ADMIN)
@Controller({ path: 'banner-categories', version: '1' })
export class BannerCategoriesController {
  constructor(private readonly svc: BannerCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List banner categories (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.svc.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create banner category (admin)' })
  create(@Body() dto: CreateBannerCategoryDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update banner category (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateBannerCategoryDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
