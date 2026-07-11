import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../common/audit/audit-log.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /** Global/system roles (organizationId null) plus this org's own custom roles — never another org's. */
  findAll(organizationId: string) {
    return this.prisma.role.findMany({
      where: { OR: [{ organizationId: null }, { organizationId }] },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, isCustom: true, isOrgWide: true, organizationId: true },
    });
  }

  async findById(id: string, organizationId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    // 404 (not 403) for a role belonging to another org — existence itself
    // shouldn't be observable cross-tenant.
    if (!role || (role.organizationId !== null && role.organizationId !== organizationId)) {
      throw new NotFoundException(`Role ${id} not found.`);
    }
    return role;
  }

  /**
   * Custom roles only — the 14 seeded built-in roles are never created
   * through the API. Always scoped to the caller's organization (see
   * schema.prisma's Role doc comment / docs/adr/0001) — a custom role
   * created by one organization is never visible to, assignable by, or
   * editable by another.
   */
  async create(dto: CreateRoleDto, organizationId: string, actorId: string) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists.`);
    }

    const permissionIds = dto.permissionActions
      ? await this.resolvePermissionIds(dto.permissionActions)
      : [];

    const created = await this.prisma.role.create({
      data: {
        name: dto.name,
        isCustom: true,
        isOrgWide: dto.isOrgWide ?? false,
        organizationId,
        permissions: { create: permissionIds.map((permissionId) => ({ permissionId })) },
      },
    });

    await this.auditLog.record({
      entityType: 'Role',
      entityId: created.id,
      actorId,
      action: 'CREATE',
      after: { name: created.name, isOrgWide: created.isOrgWide },
    });

    return this.findById(created.id, organizationId);
  }

  async update(id: string, organizationId: string, dto: UpdateRoleDto, actorId: string) {
    const before = await this.mustBeCustom(id, organizationId, 'modified');

    const permissionIds =
      dto.permissionActions !== undefined
        ? await this.resolvePermissionIds(dto.permissionActions)
        : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.isOrgWide !== undefined ? { isOrgWide: dto.isOrgWide } : {}),
        },
      });

      if (permissionIds !== null) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
        });
      }
    });

    const after = await this.findById(id, organizationId);

    await this.auditLog.record({
      entityType: 'Role',
      entityId: id,
      actorId,
      action: 'UPDATE',
      before: { name: before.name, isOrgWide: before.isOrgWide },
      after: { name: after.name, isOrgWide: after.isOrgWide },
    });

    return after;
  }

  async remove(id: string, organizationId: string, actorId: string) {
    const role = await this.mustBeCustom(id, organizationId, 'deleted');

    const inUseCount = await this.prisma.brandAccess.count({ where: { roleId: id } });
    if (inUseCount > 0) {
      throw new ConflictException(
        `Role "${role.name}" is still assigned to ${inUseCount} user(s) — revoke those grants before deleting it.`,
      );
    }

    await this.prisma.role.delete({ where: { id } });

    await this.auditLog.record({
      entityType: 'Role',
      entityId: id,
      actorId,
      action: 'DELETE',
      before: { name: role.name },
    });
  }

  /**
   * A role can be modified/deleted only if it's custom AND belongs to the
   * caller's organization — a global/system role is never editable via API,
   * and another organization's custom role is never editable by this one.
   */
  private async mustBeCustom(id: string, organizationId: string, verb: 'modified' | 'deleted') {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role || (role.organizationId !== null && role.organizationId !== organizationId)) {
      throw new NotFoundException(`Role ${id} not found.`);
    }
    if (!role.isCustom) {
      throw new ForbiddenException(`Built-in role "${role.name}" cannot be ${verb}.`);
    }
    return role;
  }

  private async resolvePermissionIds(actions: string[]): Promise<string[]> {
    if (actions.length === 0) {
      return [];
    }
    const permissions = await this.prisma.permission.findMany({
      where: { action: { in: actions } },
    });
    const found = new Set(permissions.map((p) => p.action));
    const missing = actions.filter((a) => !found.has(a));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Unknown permission action(s): ${missing.join(', ')}. Create them via POST /permissions first.`,
      );
    }
    return permissions.map((p) => p.id);
  }
}
