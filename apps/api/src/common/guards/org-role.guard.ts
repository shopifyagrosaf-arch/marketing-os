import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ORG_ROLES_KEY } from '../decorators/org-roles.decorator';

/** Guards org-wide actions (not scoped to a single brand) by org-wide role. */
@Injectable()
export class OrgRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ORG_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authentication required.');
    }

    const orgWideAccess = await this.prisma.brandAccess.findFirst({
      where: { userId: user.id, role: { isOrgWide: true } },
      include: { role: true },
    });

    if (!orgWideAccess || !requiredRoles.includes(orgWideAccess.role.name)) {
      throw new ForbiddenException(
        'This action requires an org-wide role: ' + requiredRoles.join(', '),
      );
    }
    return true;
  }
}
