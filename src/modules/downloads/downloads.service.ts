import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DownloadGroup } from './entities/download-group.entity';
import { CreateDownloadGroupDto } from './dto/create-download-group.dto';
import { UpdateDownloadGroupDto } from './dto/update-download-group.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['title', 'sortOrder', 'createdAt'];

@Injectable()
export class DownloadsService {
  constructor(
    @InjectRepository(DownloadGroup)
    private readonly repo: Repository<DownloadGroup>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<DownloadGroup>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'sortOrder');
    const qb = this.repo.createQueryBuilder('d').orderBy(`d.${field}`, order);
    if (search) qb.where('d.title ILIKE :s OR d.description ILIKE :s', { s: `%${search}%` });
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<DownloadGroup> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Download group #${id} not found`);
    return item;
  }

  async create(dto: CreateDownloadGroupDto): Promise<DownloadGroup> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateDownloadGroupDto): Promise<DownloadGroup> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Download group #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
