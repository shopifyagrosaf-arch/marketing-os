import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../common/audit/audit-log.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  findAll() {
    return this.prisma.permission.findMany({ orderBy: { action: 'asc' } });
  }

  async create(dto: CreatePermissionDto, actorId: string) {
    const existing = await this.prisma.permission.findUnique({ where: { action: dto.action } });
    if (existing) {
      throw new ConflictException(`Permission "${dto.action}" already exists.`);
    }

    const created = await this.prisma.permission.create({
      data: { action: dto.action, description: dto.description },
    });

    await this.auditLog.record({
      entityType: 'Permission',
      entityId: created.id,
      actorId,
      action: 'CREATE',
      after: { action: created.action },
    });

    return created;
  }
}
