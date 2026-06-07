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
import { ContactService } from './contact.service';
import { SubmitContactDto } from './dto/submit-contact.dto';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { BulkStatusDto } from './dto/bulk-status.dto';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Contact')
@Controller({ path: 'contact', version: '1' })
export class ContactController {
  constructor(private readonly svc: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit contact form (public)' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  submit(@Body() dto: SubmitContactDto) {
    return this.svc.submit(dto);
  }
}

@ApiTags('Contact Messages (Admin)')
@Controller({ path: 'contact-messages', version: '1' })
export class ContactMessagesController {
  constructor(private readonly svc: ContactService) {}

  @Get()
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List contact messages (admin)' })
  findAll(@Query() query: ContactQueryDto) {
    return this.svc.findAll(query);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update contact message status (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateContactMessageDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post('bulk-status')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk update status (admin)' })
  bulkStatus(@Body() dto: BulkStatusDto) {
    return this.svc.bulkStatus(dto);
  }

  @Post('bulk-delete')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.svc.bulkDelete(dto);
  }
}
