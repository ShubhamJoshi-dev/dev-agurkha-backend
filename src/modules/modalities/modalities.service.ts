import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Modality } from './entities/modality.entity';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['title', 'number', 'sortOrder', 'createdAt'];

@Injectable()
export class ModalitiesService {
  constructor(
    @InjectRepository(Modality)
    private readonly repo: Repository<Modality>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<Modality>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'sortOrder');
    const qb = this.repo.createQueryBuilder('m').orderBy(`m.${field}`, order);
    if (search) {
      qb.where('m.title ILIKE :s OR m.description ILIKE :s', { s: `%${search}%` });
    }
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<Modality> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Modality #${id} not found`);
    return item;
  }

  async findBySlug(slug: string): Promise<Modality> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException(`Modality with slug "${slug}" not found`);
    return item;
  }

  async create(dto: CreateModalityDto): Promise<Modality> {
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (e: unknown) {
      if ((e as { code?: string }).code === '23505')
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      throw e;
    }
  }

  async update(id: string, dto: UpdateModalityDto): Promise<Modality> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Modality #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
