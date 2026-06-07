import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['title', 'slug', 'status', 'publishAt', 'createdAt'];

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly repo: Repository<Page>,
  ) {}

  async findAll(query: PageQueryDto): Promise<Paginated<Page>> {
    const { page, perPage, search, sort, status } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'createdAt');
    const qb = this.repo.createQueryBuilder('p').orderBy(`p.${field}`, order);
    if (search) qb.andWhere('p.title ILIKE :s OR p.slug ILIKE :s', { s: `%${search}%` });
    if (status) qb.andWhere('p.status = :status', { status });
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<Page> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Page #${id} not found`);
    return item;
  }

  async findBySlug(slug: string): Promise<Page> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException(`Page with slug "${slug}" not found`);
    return item;
  }

  async create(dto: CreatePageDto): Promise<Page> {
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (e: unknown) {
      if ((e as { code?: string }).code === '23505')
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      throw e;
    }
  }

  async update(id: string, dto: UpdatePageDto): Promise<Page> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Page #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
