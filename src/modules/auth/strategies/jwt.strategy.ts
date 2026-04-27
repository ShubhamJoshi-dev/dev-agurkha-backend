import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { TokenBlocklistService } from '../../../common/blocklist/token-blocklist.service';
import { Role } from '../../users/entities/user.entity';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly blocklist: TokenBlocklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (this.blocklist.has(payload.jti)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // Guard against a tampered role claim in the token
    if (user.role !== payload.role) {
      throw new UnauthorizedException('Token role mismatch');
    }

    const { password: _password, ...safeUser } = user;
    return { ...safeUser, jti: payload.jti };
  }
}
