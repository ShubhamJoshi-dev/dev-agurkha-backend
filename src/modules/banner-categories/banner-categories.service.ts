import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerCategory } from './entities/banner-category.entity';
import { CreateBannerCategoryDto } from './dto/create-banner-category.dto';
import { UpdateBannerCategoryDto } from './dto/update-banner-category.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['name', 'slug', 'createdAt'];

@Injectable()
export class BannerCategoriesService {
  constructor(
    @InjectRepository(BannerCategory)
    private readonly repo: Repository<BannerCategory>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<BannerCategory>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'createdAt');
    const qb = this.repo.createQueryBuilder('bc').orderBy(`bc.${field}`, order);
    if (search) qb.where('bc.name ILIKE :s OR bc.slug ILIKE :s', { s: `%${search}%` });
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<BannerCategory> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Banner category #${id} not found`);
    return item;
  }

  async create(dto: CreateBannerCategoryDto): Promise<BannerCategory> {
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (e: unknown) {
      if ((e as { code?: string }).code === '23505')
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      throw e;
    }
  }

  async update(id: string, dto: UpdateBannerCategoryDto): Promise<BannerCategory> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Banner category #${id} not found`);
  }
}
