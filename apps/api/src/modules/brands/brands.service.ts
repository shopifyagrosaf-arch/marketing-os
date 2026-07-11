import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Brands available to the brand switcher for this user: all brands in
   * the org if the caller holds an org-wide role (Super Admin, Marketing
   * Head), otherwise only the brands they have an explicit BrandAccess row for.
   */
  async findMineForUser(userId: string, organizationId: string) {
    const orgWideAccess = await this.prisma.brandAccess.findFirst({
      where: { userId, role: { isOrgWide: true } },
    });

    if (orgWideAccess) {
      return this.prisma.brand.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
      });
    }

    const access = await this.prisma.brandAccess.findMany({
      where: { userId },
      include: { brand: true },
      orderBy: { brand: { name: 'asc' } },
    });
    return access.map((a) => a.brand);
  }

  /**
   * Fetches a single brand by id, enforcing that the caller either has an
   * explicit BrandAccess row for it or holds an org-wide role. Access check
   * lives here (not a header-driven guard) because the brand id for this
   * endpoint comes from the path param, not an `x-brand-id` header.
   */
  async findByIdForUser(id: string, userId: string, organizationId: string) {
    const brand = await this.prisma.brand.findFirst({ where: { id, organizationId } });
    if (!brand) {
      throw new NotFoundException(`Brand ${id} not found.`);
    }

    const hasAccess = await this.prisma.brandAccess.findFirst({
      where: {
        userId,
        OR: [{ brandId: id }, { role: { isOrgWide: true } }],
      },
    });
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this brand.');
    }

    return brand;
  }

  async create(dto: CreateBrandDto, organizationId: string) {
    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        localeDefault: dto.localeDefault ?? 'en',
        organizationId,
      },
    });
  }

  /**
   * Updates the brand resolved by BrandAccessGuard for the current request
   * (see BrandsController#updateMine). Access/role checks already happened
   * in the guard chain by the time this runs — this method only handles
   * the write and its audit trail.
   */
  async updateForBrandContext(brandId: string, actorId: string, dto: UpdateBrandDto) {
    const before = await this.prisma.brand.findUniqueOrThrow({ where: { id: brandId } });

    const updated = await this.prisma.brand.update({
      where: { id: brandId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.localeDefault !== undefined ? { localeDefault: dto.localeDefault } : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        entityType: 'Brand',
        entityId: brandId,
        actorId,
        action: 'UPDATE',
        before: { name: before.name, localeDefault: before.localeDefault },
        after: { name: updated.name, localeDefault: updated.localeDefault },
      },
    });

    return updated;
  }
}
