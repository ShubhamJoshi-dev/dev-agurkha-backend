import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['name', 'role', 'sortOrder', 'createdAt'];

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly repo: Repository<TeamMember>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<TeamMember>> {
    const { page, perPage, search, sort } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'sortOrder');
    const qb = this.repo.createQueryBuilder('t').orderBy(`t.${field}`, order);
    if (search) {
      qb.where('t.name ILIKE :s OR t.role ILIKE :s', { s: `%${search}%` });
    }
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<TeamMember> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Team member #${id} not found`);
    return item;
  }

  async create(dto: CreateTeamMemberDto): Promise<TeamMember> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateTeamMemberDto): Promise<TeamMember> {
    const item = await this.findOne(id);
    return this.repo.save(this.repo.merge(item, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Team member #${id} not found`);
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}
