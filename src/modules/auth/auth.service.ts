import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
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

    const jti = randomUUID();
    const payload = { sub: user.id, email: user.email, jti };

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
}
