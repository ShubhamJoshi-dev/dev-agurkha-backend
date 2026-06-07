import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NewsPost } from './entities/news-post.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsQueryDto } from './dto/news-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['title', 'date', 'category', 'status', 'createdAt'];

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsPost)
    private readonly repo: Repository<NewsPost>,
  ) {}

  async findAll(query: NewsQueryDto): Promise<Paginated<NewsPost>> {
    const { page, perPage, search, sort, status } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'date');
    const qb = this.repo.createQueryBuilder('n').orderBy(`n.${field}`, order);
    if (search) {
      qb.andWhere('n.title ILIKE :s OR n.excerpt ILIKE :s OR n.category ILIKE :s', { s: `%${search}%` });
    }
    if (status) qb.andWhere('n.status = :status', { status });
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<NewsPost> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`News post #${id} not found`);
    return item;
  }

  async findBySlug(slug: string): Promise<NewsPost> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException(`News post with slug "${slug}" not found`);
    return item;
  }

  async create(dto: CreateNewsDto): Promise<NewsPost> {
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (e: unknown) {
      if ((e as { code?: string }).code === '23505')
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      throw e;
    }
  }

  async update(id: string, dto: UpdateNewsDto): Promise<NewsPost> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`News post #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
