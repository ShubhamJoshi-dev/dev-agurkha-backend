import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage, StorageEngine } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { MediaService } from './media.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../users/entities/user.entity';
import * as fs from 'fs';

const uploadStorage: StorageEngine = diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    const dest = 'uploads';
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

@ApiTags('Media')
@Auth(Role.ADMIN, Role.SUPER_ADMIN)
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'List media items (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.svc.findAll(query);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: uploadStorage }))
  @ApiOperation({ summary: 'Upload a file (admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('No file uploaded');
    // Honour the proxy's forwarded protocol (Render/NGINX terminate TLS), so
    // media URLs are https in production instead of http (mixed content) —
    // see docs/BACKEND_NEEDS.md #3.
    const forwardedProto = (req.headers['x-forwarded-proto'] as string)
      ?.split(',')[0]
      ?.trim();
    const proto = forwardedProto || req.protocol;
    const baseUrl = `${proto}://${req.get('host')}`;
    return this.svc.create(file, baseUrl);
  }

  @Delete('bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.svc.bulkDelete(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
