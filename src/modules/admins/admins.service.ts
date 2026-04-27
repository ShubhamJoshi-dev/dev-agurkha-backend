import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role } from '../users/entities/user.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { BCRYPT_SALT_ROUNDS } from '../../common/constants/app.constants';

type SafeAdmin = Omit<User, 'password'>;

function toSafe(user: User): SafeAdmin {
  const { password: _password, ...safe } = user;
  return safe;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error as QueryFailedError & { code: string }).code === '23505'
  );
}

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateAdminDto): Promise<SafeAdmin> {
    const admin = this.userRepository.create({
      ...dto,
      role: Role.ADMIN,
      password: await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
    });

    return this.userRepository
      .save(admin)
      .then(toSafe)
      .catch((error) => {
        if (isUniqueViolation(error)) {
          throw new ConflictException('User with this email already exists');
        }
        throw error;
      });
  }

  async findAll(): Promise<SafeAdmin[]> {
    return this.userRepository.find({ where: { role: Role.ADMIN } });
  }

  async findOne(id: string): Promise<SafeAdmin> {
    const admin = await this.userRepository.findOne({
      where: { id, role: Role.ADMIN },
    });
    if (!admin) {
      throw new NotFoundException(`Admin #${id} not found`);
    }
    return admin;
  }

  async update(id: string, dto: UpdateAdminDto): Promise<SafeAdmin> {
    const admin = await this.userRepository.findOne({
      where: { id, role: Role.ADMIN },
    });
    if (!admin) {
      throw new NotFoundException(`Admin #${id} not found`);
    }
    const updated = this.userRepository.merge(admin, dto);
    return this.userRepository.save(updated).then(toSafe);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete({ id, role: Role.ADMIN });
    if (result.affected === 0) {
      throw new NotFoundException(`Admin #${id} not found`);
    }
  }

  async deactivate(id: string): Promise<SafeAdmin> {
    const admin = await this.userRepository.findOne({
      where: { id, role: Role.ADMIN },
    });
    if (!admin) {
      throw new NotFoundException(`Admin #${id} not found`);
    }
    admin.isActive = false;
    return this.userRepository.save(admin).then(toSafe);
  }

  async activate(id: string): Promise<SafeAdmin> {
    const admin = await this.userRepository.findOne({
      where: { id, role: Role.ADMIN },
    });
    if (!admin) {
      throw new NotFoundException(`Admin #${id} not found`);
    }
    admin.isActive = true;
    return this.userRepository.save(admin).then(toSafe);
  }
}
