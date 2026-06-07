import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { Role } from '../../modules/users/entities/user.entity';
import { Roles } from './roles.decorator';
import { JwtRolesGuard } from '../guards/jwt-roles.guard';

/**
 * Composes JWT authentication + role authorization + Swagger annotations
 * into a single decorator.
 *
 * Usage:
 *   @Auth()                          // authenticated, any role
 *   @Auth(Role.ADMIN, Role.SUPER_ADMIN)  // specific roles only
 */
export const Auth = (...roles: Role[]) =>
  applyDecorators(
    Roles(...roles),
    UseGuards(JwtRolesGuard),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: 'Missing or invalid token' }),
    ...(roles.length > 0
      ? [ApiForbiddenResponse({ description: 'Insufficient permissions' })]
      : []),
  );
