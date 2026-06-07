import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly repo: Repository<Setting>,
  ) {}

  async get(key: string): Promise<Record<string, unknown>> {
    const setting = await this.repo.findOne({ where: { key } });
    return setting?.value ?? {};
  }

  async upsert(key: string, patch: Record<string, unknown>): Promise<Record<string, unknown>> {
    let setting = await this.repo.findOne({ where: { key } });
    if (!setting) {
      setting = this.repo.create({ key, value: {} });
    }
    setting.value = { ...setting.value, ...patch };
    const saved = await this.repo.save(setting);
    return saved.value;
  }
}
