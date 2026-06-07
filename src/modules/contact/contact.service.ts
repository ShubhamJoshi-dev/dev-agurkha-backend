import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { SubmitContactDto } from './dto/submit-contact.dto';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { BulkStatusDto } from './dto/bulk-status.dto';
import { paginate, parseSort } from '../../common/helpers/pagination.helper';
import { BulkDeleteDto } from '../../common/dto/bulk-delete.dto';
import { Paginated } from '../../common/dto/paginated.dto';

const ALLOWED_SORT = ['createdAt', 'status', 'name', 'email'];

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly repo: Repository<ContactMessage>,
  ) {}

  async submit(dto: SubmitContactDto): Promise<{ ok: true }> {
    await this.repo.save(this.repo.create(dto));
    return { ok: true };
  }

  async findAll(query: ContactQueryDto): Promise<Paginated<ContactMessage>> {
    const { page, perPage, sort, status } = query;
    const [field, order] = parseSort(sort, ALLOWED_SORT, 'createdAt');
    const qb = this.repo.createQueryBuilder('c').orderBy(`c.${field}`, order);
    if (status) qb.where('c.status = :status', { status });
    return paginate(qb, page, perPage);
  }

  async findOne(id: string): Promise<ContactMessage> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Contact message #${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateContactMessageDto): Promise<ContactMessage> {
    const item = await this.findOne(id);
    item.status = dto.status;
    return this.repo.save(item);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Contact message #${id} not found`);
  }

  async bulkStatus(dto: BulkStatusDto): Promise<void> {
    await this.repo.update({ id: In(dto.ids) }, { status: dto.status });
  }

  async bulkDelete(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }

  async countByMonth(): Promise<{ month: string; received: number }[]> {
    const rows = await this.repo
      .createQueryBuilder('c')
      .select("TO_CHAR(c.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'received')
      .groupBy("TO_CHAR(c.createdAt, 'YYYY-MM')")
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany<{ month: string; received: string }>();
    return rows.map((r) => ({ month: r.month, received: parseInt(r.received, 10) }));
  }
}
