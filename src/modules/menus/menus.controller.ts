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
import { ApiTags, ApiOperation, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { MenuQueryDto } from './dto/menu-query.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class PublicMenuQuery {
  @ApiPropertyOptional({ enum: ['header', 'footer'] })
  @IsOptional()
  @IsString()
  location?: string;
}

@ApiTags('Menus')
@Controller({ path: 'menus', version: '1' })
export class MenusController {
  constructor(private readonly svc: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'List menus — public uses ?location=header|footer; admin gets paginated list' })
  @ApiOkResponse({ description: 'Menu items' })
  findAll(@Query() query: MenuQueryDto) {
    if (query.location) {
      return this.svc.findPublic(query.location);
    }
    return this.svc.findAll(query);
  }

  @Post()
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create menu item (admin)' })
  create(@Body() dto: CreateMenuItemDto) {
    return this.svc.create(dto);
  }

  @Patch('reorder')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reorder menu items (admin)' })
  @ApiNoContentResponse()
  reorder(@Body() dto: ReorderMenuDto) {
    return this.svc.reorder(dto);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update menu item (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
