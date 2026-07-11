import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../common/audit/audit-log.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found.`);
    }
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto, actorId: string) {
    const before = await this.findById(id);

    const updated = await this.prisma.organization.update({
      where: { id },
      data: { ...(dto.name !== undefined ? { name: dto.name } : {}) },
    });

    await this.auditLog.record({
      entityType: 'Organization',
      entityId: id,
      actorId,
      action: 'UPDATE',
      before: { name: before.name },
      after: { name: updated.name },
    });

    return updated;
  }
}
