import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['title', 'sortOrder', 'createdAt', 'updatedAt'];

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly repo: Repository<Service>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<Service>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'sortOrder');
    const qb = this.repo
      .createQueryBuilder('s')
      .orderBy(`s.${field}`, order);

    if (search) {
      qb.where('s.title ILIKE :s OR s.shortDescription ILIKE :s', {
        s: `%${search}%`,
      });
    }

    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<Service> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Service #${id} not found`);
    return item;
  }

  async findBySlug(slug: string): Promise<Service> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException(`Service with slug "${slug}" not found`);
    return item;
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (e: unknown) {
      if ((e as { code?: string }).code === '23505')
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      throw e;
    }
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Service #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
