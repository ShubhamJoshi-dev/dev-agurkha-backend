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
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Banners')
@Auth(Role.ADMIN, Role.SUPER_ADMIN)
@Controller({ path: 'banners', version: '1' })
export class BannersController {
  constructor(private readonly svc: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'List banners (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.svc.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create banner (admin)' })
  create(@Body() dto: CreateBannerDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update banner (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.svc.bulkDelete(dto);
  }
}
