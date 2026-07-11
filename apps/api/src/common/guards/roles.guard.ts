import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Checks the role resolved by BrandAccessGuard (request.brandContext) against
 * the roles required by @Roles(...) on the handler. Must run after
 * BrandAccessGuard in the guard chain.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const brandContext = request.brandContext;
    if (!brandContext) {
      throw new ForbiddenException(
        'Role check requires BrandAccessGuard to run first (no brand context resolved).',
      );
    }

    if (!requiredRoles.includes(brandContext.roleName)) {
      throw new ForbiddenException(
        `Role "${brandContext.roleName}" is not permitted to perform this action.`,
      );
    }
    return true;
  }
}
