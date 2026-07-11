import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../common/audit/audit-log.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { GrantBrandAccessDto } from './dto/grant-brand-access.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAllForOrg(organizationId: string, query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      organizationId,
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' as const } },
              { name: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findByIdForOrg(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found.`);
    }
    return user;
  }

  /**
   * Pre-provisions a user (and optionally grants initial brand access) ahead
   * of their first SSO login. If they already have a row (e.g. they already
   * logged in once before an admin got around to organizing access), this
   * still succeeds and just adds any new BrandAccess grants — it does not
   * error on "already exists," since that's the expected common case.
   */
  async create(dto: CreateUserDto, organizationId: string, actorId: string) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (user && user.organizationId !== organizationId) {
      throw new ConflictException('This email belongs to a user in a different organization.');
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: { email: dto.email, name: dto.name, organizationId },
      });
      await this.auditLog.record({
        entityType: 'User',
        entityId: user.id,
        actorId,
        action: 'CREATE',
        after: { email: user.email, name: user.name },
      });
    }

    if (dto.brandAccess?.length) {
      for (const grant of dto.brandAccess) {
        await this.grantBrandAccess(user.id, organizationId, grant, actorId);
      }
    }

    return user;
  }

  async update(id: string, organizationId: string, dto: UpdateUserDto, actorId: string) {
    const before = await this.findByIdForOrg(id, organizationId);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { ...(dto.name !== undefined ? { name: dto.name } : {}) },
    });

    await this.auditLog.record({
      entityType: 'User',
      entityId: id,
      actorId,
      action: 'UPDATE',
      before: { name: before.name },
      after: { name: updated.name },
    });

    return updated;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    dto: UpdateUserStatusDto,
    actorId: string,
  ) {
    const before = await this.findByIdForOrg(id, organizationId);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.auditLog.record({
      entityType: 'User',
      entityId: id,
      actorId,
      action: 'STATUS_CHANGE',
      before: { status: before.status },
      after: { status: updated.status },
    });

    return updated;
  }

  async listBrandAccess(userId: string, organizationId: string) {
    await this.findByIdForOrg(userId, organizationId);
    return this.prisma.brandAccess.findMany({
      where: { userId },
      include: { brand: true, role: true },
      orderBy: { brand: { name: 'asc' } },
    });
  }

  async grantBrandAccess(
    userId: string,
    organizationId: string,
    dto: GrantBrandAccessDto,
    actorId: string,
  ) {
    await this.findByIdForOrg(userId, organizationId);

    const brand = await this.prisma.brand.findFirst({
      where: { id: dto.brandId, organizationId },
    });
    if (!brand) {
      throw new NotFoundException(`Brand ${dto.brandId} not found in this organization.`);
    }

    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    // A role is grantable here only if it's global (organizationId null,
    // the 14 built-ins) or belongs to this same organization — never
    // another organization's custom role (see docs/adr/0001).
    if (!role || (role.organizationId !== null && role.organizationId !== organizationId)) {
      throw new NotFoundException(`Role ${dto.roleId} not found.`);
    }

    const existing = await this.prisma.brandAccess.findUnique({
      where: { userId_brandId_roleId: { userId, brandId: dto.brandId, roleId: dto.roleId } },
    });
    if (existing) {
      return existing;
    }

    const created = await this.prisma.brandAccess.create({
      data: { userId, brandId: dto.brandId, roleId: dto.roleId },
    });

    await this.auditLog.record({
      entityType: 'BrandAccess',
      entityId: created.id,
      actorId,
      action: 'GRANT',
      after: { userId, brandId: dto.brandId, roleName: role.name },
    });

    return created;
  }

  async revokeBrandAccess(
    userId: string,
    organizationId: string,
    brandAccessId: string,
    actorId: string,
  ) {
    await this.findByIdForOrg(userId, organizationId);

    const access = await this.prisma.brandAccess.findFirst({
      where: { id: brandAccessId, userId },
      include: { role: true },
    });
    if (!access) {
      throw new NotFoundException(`Brand access grant ${brandAccessId} not found for this user.`);
    }

    await this.prisma.brandAccess.delete({ where: { id: brandAccessId } });

    await this.auditLog.record({
      entityType: 'BrandAccess',
      entityId: brandAccessId,
      actorId,
      action: 'REVOKE',
      before: { userId, brandId: access.brandId, roleName: access.role.name },
    });
  }
}
