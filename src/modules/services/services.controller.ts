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
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Services')
@Controller({ path: 'services', version: '1' })
export class ServicesController {
  constructor(private readonly svc: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List services (public)' })
  @ApiOkResponse({ description: 'Paginated list of services' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.svc.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get service by slug (public)' })
  @ApiNotFoundResponse()
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID (public)' })
  @ApiNotFoundResponse()
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create service (admin)' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateServiceDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update service (admin)' })
  @ApiOkResponse()
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete service (admin)' })
  @ApiNoContentResponse()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post('bulk-delete')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete services (admin)' })
  @ApiNoContentResponse()
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.svc.bulkDelete(dto);
  }
}
