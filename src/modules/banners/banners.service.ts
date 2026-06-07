import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['title', 'sortOrder', 'isActive', 'publishFrom', 'createdAt'];

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly repo: Repository<Banner>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<Banner>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'sortOrder');
    const qb = this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.category', 'category')
      .orderBy(`b.${field}`, order);
    if (search) qb.where('b.title ILIKE :s', { s: `%${search}%` });
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<Banner> {
    const item = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!item) throw new NotFoundException(`Banner #${id} not found`);
    return item;
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Banner #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
