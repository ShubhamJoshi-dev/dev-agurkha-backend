import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContentBlock } from './entities/content-block.entity';
import { CreateContentBlockDto } from './dto/create-content-block.dto';
import { UpdateContentBlockDto } from './dto/update-content-block.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['key', 'title', 'createdAt'];

@Injectable()
export class ContentBlocksService {
  constructor(
    @InjectRepository(ContentBlock)
    private readonly repo: Repository<ContentBlock>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<ContentBlock>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'createdAt');
    const qb = this.repo.createQueryBuilder('c').orderBy(`c.${field}`, order);
    if (search) qb.where('c.key ILIKE :s OR c.title ILIKE :s', { s: `%${search}%` });
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<ContentBlock> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Content block #${id} not found`);
    return item;
  }

  async findByKey(key: string): Promise<ContentBlock> {
    const item = await this.repo.findOne({ where: { key } });
    if (!item) throw new NotFoundException(`Content block with key "${key}" not found`);
    return item;
  }

  async create(dto: CreateContentBlockDto): Promise<ContentBlock> {
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (e: unknown) {
      if ((e as { code?: string }).code === '23505')
        throw new ConflictException(`Key "${dto.key}" is already taken`);
      throw e;
    }
  }

  async update(id: string, dto: UpdateContentBlockDto): Promise<ContentBlock> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Content block #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
