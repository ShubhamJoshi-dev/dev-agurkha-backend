import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['title', 'createdAt', 'updatedAt'];

@Injectable()
export class GalleriesService {
  constructor(
    @InjectRepository(Gallery)
    private readonly repo: Repository<Gallery>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<Gallery>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'createdAt');
    const qb = this.repo.createQueryBuilder('g').orderBy(`g.${field}`, order);
    if (search) qb.where('g.title ILIKE :s OR g.description ILIKE :s', { s: `%${search}%` });
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<Gallery> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Gallery #${id} not found`);
    return item;
  }

  async findBySlug(slug: string): Promise<Gallery> {
    const item = await this.repo.findOne({ where: { slug } });
    if (!item) throw new NotFoundException(`Gallery with slug "${slug}" not found`);
    return item;
  }

  async create(dto: CreateGalleryDto): Promise<Gallery> {
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (e: unknown) {
      if ((e as { code?: string }).code === '23505')
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      throw e;
    }
  }

  async update(id: string, dto: UpdateGalleryDto): Promise<Gallery> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Gallery #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
