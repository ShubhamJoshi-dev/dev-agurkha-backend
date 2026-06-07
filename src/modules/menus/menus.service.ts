import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { MenuQueryDto } from './dto/menu-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['label', 'location', 'sortOrder', 'createdAt'];

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly repo: Repository<MenuItem>,
  ) {}

  async findAll(query: MenuQueryDto): Promise<Paginated<MenuItem>> {
    const { page, perPage, sort, location } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'sortOrder');
    const qb = this.repo.createQueryBuilder('m').orderBy(`m.${field}`, order);
    if (location) qb.where('m.location = :location', { location });
    return paginate(qb, page, perPage);
  }

  async findPublic(location?: string): Promise<MenuItem[]> {
    const qb = this.repo.createQueryBuilder('m').orderBy('m.sortOrder', 'ASC');
    if (location) qb.where('m.location = :location', { location });
    return qb.getMany();
  }

  async findOne(id: string): Promise<MenuItem> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Menu item #${id} not found`);
    return item;
  }

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Menu item #${id} not found`);
  }

  async reorder(dto: ReorderMenuDto): Promise<void> {
    await Promise.all(
      dto.items.map((item) =>
        this.repo.update(item.id, { sortOrder: item.sortOrder }),
      ),
    );
  }
}
