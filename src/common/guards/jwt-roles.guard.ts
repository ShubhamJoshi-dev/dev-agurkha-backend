import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Role } from '../../modules/users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class JwtRolesGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Runs JwtStrategy.validate() and populates request.user.
    // Throws UnauthorizedException on any token failure.
    await super.canActivate(context);

    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: { role: Role } }>();

    if (!required.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  handleRequest<T>(err: Error | null, user: T, info: Error | null): T {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Token has expired');
    }

    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token');
    }

    if (err) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return user;
  }
}
