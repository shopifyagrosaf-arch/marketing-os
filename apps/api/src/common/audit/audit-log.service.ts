import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Single place every module writes audit entries through, instead of each
 * service hand-rolling its own `prisma.auditLog.create(...)` call (Sprint 1
 * did this inline in BrandsService — Sprint 2 centralizes it since the
 * number of audited mutations grew significantly).
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    entityType: string;
    entityId: string;
    actorId: string | null;
    action: string;
    before?: unknown;
    after?: unknown;
  }) {
    await this.prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        actorId: params.actorId,
        action: params.action,
        before: params.before === undefined ? undefined : (params.before as object),
        after: params.after === undefined ? undefined : (params.after as object),
      },
    });
  }
}
