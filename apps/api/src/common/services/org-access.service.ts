import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface OrgWideAccess {
  roleId: string;
  roleName: string;
}

/**
 * Centralizes the "does this user hold an org-wide role" lookup — used by
 * OrgRoleGuard (authorization) and by the frontend-facing /auth/me response
 * (so the admin nav can decide what to show) so the two never drift apart.
 */
@Injectable()
export class OrgAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrgWideRole(userId: string): Promise<OrgWideAccess | null> {
    const access = await this.prisma.brandAccess.findFirst({
      where: { userId, role: { isOrgWide: true } },
      include: { role: true },
    });
    return access ? { roleId: access.roleId, roleName: access.role.name } : null;
  }
}
