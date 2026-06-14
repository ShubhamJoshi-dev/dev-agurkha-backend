import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role } from '../users/entities/user.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { BCRYPT_SALT_ROUNDS } from '../../common/constants/app.constants';

type SafeAdmin = Omit<User, 'password'>;

// The Admins endpoints manage privileged accounts. The seeded SUPER_ADMIN must
// be visible/manageable here too — filtering to ADMIN only made the admin
// "Users" page render empty (see docs/BACKEND_NEEDS.md #1).
const ADMIN_ROLES = [Role.ADMIN, Role.SUPER_ADMIN];

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
    return this.userRepository.find({
      where: { role: In(ADMIN_ROLES) },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SafeAdmin> {
    const admin = await this.findAdminOrFail(id);
    return admin;
  }

  async update(id: string, dto: UpdateAdminDto): Promise<SafeAdmin> {
    const admin = await this.findAdminOrFail(id);
    const updated = this.userRepository.merge(admin, dto);
    return this.userRepository.save(updated).then(toSafe);
  }

  async remove(id: string): Promise<void> {
    const admin = await this.findAdminOrFail(id);
    await this.guardLastSuperAdmin(admin, 'deleted');
    await this.userRepository.delete({ id });
  }

  async deactivate(id: string): Promise<SafeAdmin> {
    const admin = await this.findAdminOrFail(id);
    await this.guardLastSuperAdmin(admin, 'deactivated');
    admin.isActive = false;
    return this.userRepository.save(admin).then(toSafe);
  }

  async activate(id: string): Promise<SafeAdmin> {
    const admin = await this.findAdminOrFail(id);
    admin.isActive = true;
    return this.userRepository.save(admin).then(toSafe);
  }

  private async findAdminOrFail(id: string): Promise<User> {
    const admin = await this.userRepository.findOne({
      where: { id, role: In(ADMIN_ROLES) },
    });
    if (!admin) {
      throw new NotFoundException(`Admin #${id} not found`);
    }
    return admin;
  }

  /**
   * Prevent locking everyone out: the last active SUPER_ADMIN cannot be
   * deleted or deactivated.
   */
  private async guardLastSuperAdmin(
    admin: User,
    action: 'deleted' | 'deactivated',
  ): Promise<void> {
    if (admin.role !== Role.SUPER_ADMIN) return;
    const activeSuperAdmins = await this.userRepository.count({
      where: { role: Role.SUPER_ADMIN, isActive: true },
    });
    if (activeSuperAdmins <= 1) {
      throw new ForbiddenException(
        `The last active super admin cannot be ${action}.`,
      );
    }
  }
}
