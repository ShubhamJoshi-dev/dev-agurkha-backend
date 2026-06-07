import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['name', 'company', 'sortOrder', 'createdAt'];

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly repo: Repository<Testimonial>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<Testimonial>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'sortOrder');
    const qb = this.repo.createQueryBuilder('t').orderBy(`t.${field}`, order);
    if (search) {
      qb.where('t.name ILIKE :s OR t.company ILIKE :s OR t.quote ILIKE :s', { s: `%${search}%` });
    }
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<Testimonial> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Testimonial #${id} not found`);
    return item;
  }

  async create(dto: CreateTestimonialDto): Promise<Testimonial> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateTestimonialDto): Promise<Testimonial> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Testimonial #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
