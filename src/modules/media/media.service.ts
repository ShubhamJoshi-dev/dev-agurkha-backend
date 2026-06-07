import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MediaItem } from './entities/media-item.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';
import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_SORT = ['originalName', 'mimeType', 'size', 'createdAt'];

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaItem)
    private readonly repo: Repository<MediaItem>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<MediaItem>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'createdAt');
    const qb = this.repo.createQueryBuilder('m').orderBy(`m.${field}`, order);
    if (search) qb.where('m.originalName ILIKE :s', { s: `%${search}%` });
    return paginate(qb, page, perPage);
  }

  async create(file: Express.Multer.File, baseUrl: string): Promise<MediaItem> {
    const url = `${baseUrl}/uploads/${file.filename}`;
    const item = this.repo.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
    });
    return this.repo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Media item #${id} not found`);
    // Delete file from disk (best-effort)
    const filePath = path.join(process.cwd(), 'uploads', item.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await this.repo.delete(id);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    const items = await this.repo.find({ where: { id: In(dto.ids) } });
    for (const item of items) {
      const filePath = path.join(process.cwd(), 'uploads', item.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch { /* ignore */ }
      }
    }
    await this.repo.delete({ id: In(dto.ids) });
  }
}
