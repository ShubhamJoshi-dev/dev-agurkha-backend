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
import { DownloadsService } from './downloads.service';
import { CreateDownloadGroupDto } from './dto/create-download-group.dto';
import { UpdateDownloadGroupDto } from './dto/update-download-group.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Downloads')
@Controller({ path: 'downloads', version: '1' })
export class DownloadsController {
  constructor(private readonly svc: DownloadsService) {}

  @Get()
  @ApiOperation({ summary: 'List download groups (public)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.svc.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get download group by ID (public)' })
  @ApiNotFoundResponse()
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create download group (admin)' })
  create(@Body() dto: CreateDownloadGroupDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update download group (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateDownloadGroupDto) {
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
