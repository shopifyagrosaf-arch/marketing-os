import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Resolves the "which brand is this request for" question and attaches
 * the caller's role for that brand to the request as `brandContext`.
 *
 * Brand is passed per-request via the `x-brand-id` header (not baked into
 * the JWT), because the product requirement is that a user switches brands
 * without logging out — the token stays the same, only the header changes.
 *
 * Org-wide roles (Super Admin, Marketing Head) are granted access to every
 * brand in their organization even without a row for that specific brand.
 */
@Injectable()
export class BrandAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const brandId = request.headers['x-brand-id'];

    if (!user) {
      throw new ForbiddenException('Authentication required before brand resolution.');
    }
    if (!brandId || typeof brandId !== 'string') {
      throw new BadRequestException('Missing required "x-brand-id" header.');
    }

    const brand = await this.prisma.brand.findFirst({
      where: { id: brandId, organizationId: user.organizationId },
    });
    if (!brand) {
      throw new ForbiddenException('Brand not found in your organization.');
    }

    const directAccess = await this.prisma.brandAccess.findFirst({
      where: { userId: user.id, brandId },
      include: { role: true },
    });
    if (directAccess) {
      request.brandContext = {
        brandId,
        roleId: directAccess.roleId,
        roleName: directAccess.role.name,
      };
      return true;
    }

    const orgWideAccess = await this.prisma.brandAccess.findFirst({
      where: { userId: user.id, role: { isOrgWide: true } },
      include: { role: true },
    });
    if (orgWideAccess) {
      request.brandContext = {
        brandId,
        roleId: orgWideAccess.roleId,
        roleName: orgWideAccess.role.name,
      };
      return true;
    }

    throw new ForbiddenException('You do not have access to this brand.');
  }
}
