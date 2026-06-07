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
import { ApiTags, ApiOperation, ApiNoContentResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GalleriesService } from './galleries.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Galleries')
@Controller({ path: 'galleries', version: '1' })
export class GalleriesController {
  constructor(private readonly svc: GalleriesService) {}

  @Get()
  @ApiOperation({ summary: 'List galleries (public)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.svc.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get gallery by slug (public)' })
  @ApiNotFoundResponse()
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gallery by ID (public)' })
  @ApiNotFoundResponse()
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create gallery (admin)' })
  create(@Body() dto: CreateGalleryDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update gallery (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateGalleryDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post('bulk-delete')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.svc.bulkDelete(dto);
  }
}
