import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Admins')
@Auth(Role.SUPER_ADMIN)
@Controller({ path: 'admins', version: '1' })
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiCreatedResponse({ type: AdminResponseDto })
  @ApiConflictResponse({ description: 'Email already in use' })
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  @ApiOkResponse({ type: [AdminResponseDto] })
  findAll() {
    return this.adminsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an admin by ID' })
  @ApiOkResponse({ type: AdminResponseDto })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin' })
  @ApiOkResponse({ type: AdminResponseDto })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an admin' })
  @ApiNoContentResponse({ description: 'Admin deleted' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate an admin' })
  @ApiOkResponse({ type: AdminResponseDto })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  deactivate(@Param('id') id: string) {
    return this.adminsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate an admin' })
  @ApiOkResponse({ type: AdminResponseDto })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  activate(@Param('id') id: string) {
    return this.adminsService.activate(id);
  }
}
