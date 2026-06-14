import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { TokenBlocklistService } from '../../common/blocklist/token-blocklist.service';
import { BCRYPT_SALT_ROUNDS } from '../../common/constants/app.constants';

const DUMMY_HASH = bcrypt.hashSync('timing-protection-dummy', BCRYPT_SALT_ROUNDS);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly blocklist: TokenBlocklistService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    const hash = user?.password ?? DUMMY_HASH;
    const isValid = await bcrypt.compare(loginDto.password, hash);

    if (!user || !isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const jti = randomUUID();
    const payload = { sub: user.id, email: user.email, role: user.role, jti };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  logout(jti: string) {
    this.blocklist.add(jti);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.email !== undefined) patch.email = dto.email;
    if (dto.password !== undefined) {
      // Verify the current password before allowing a change.
      const current = await this.usersService.findOne(userId);
      const withHash = await this.usersService.findByEmail(current.email);
      const valid =
        !!withHash?.password &&
        !!dto.currentPassword &&
        (await bcrypt.compare(dto.currentPassword, withHash.password));
      if (!valid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      patch.password = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    }
    return this.usersService.updateRaw(userId, patch);
  }

  async setupSuperAdmin(dto: CreateUserDto, providedSecret: string, configSecret: string | undefined) {
    if (!configSecret || providedSecret !== configSecret) {
      throw new UnauthorizedException('Invalid setup secret');
    }

    const alreadyExists = await this.usersService.superAdminExists();
    if (alreadyExists) {
      throw new ConflictException('A super admin already exists');
    }

    return this.usersService.createSuperAdmin(dto);
  }
}
