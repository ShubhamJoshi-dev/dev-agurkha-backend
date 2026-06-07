import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Affiliate } from './entities/affiliate.entity';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['name', 'sortOrder', 'createdAt'];

@Injectable()
export class AffiliatesService {
  constructor(
    @InjectRepository(Affiliate)
    private readonly repo: Repository<Affiliate>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<Affiliate>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'sortOrder');
    const qb = this.repo.createQueryBuilder('a').orderBy(`a.${field}`, order);
    if (search) qb.where('a.name ILIKE :s', { s: `%${search}%` });
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<Affiliate> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Affiliate #${id} not found`);
    return item;
  }

  async create(dto: CreateAffiliateDto): Promise<Affiliate> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateAffiliateDto): Promise<Affiliate> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Affiliate #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
