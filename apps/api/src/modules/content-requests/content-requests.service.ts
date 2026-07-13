import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentRequestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../common/audit/audit-log.service';
import { OrgAccessService } from '../../common/services/org-access.service';
import { CreateContentRequestDto } from './dto/create-content-request.dto';
import { UpdateContentRequestDto } from './dto/update-content-request.dto';
import { ListContentRequestsQueryDto } from './dto/list-content-requests-query.dto';
import { assertValidContentRequestTransition } from './content-request-workflow';

@Injectable()
export class ContentRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly orgAccess: OrgAccessService,
  ) {}

  /** Intake is open to anyone with access to the brand — approval-stage gatekeeping is a later sprint's concern, not this one's. */
  async create(dto: CreateContentRequestDto, brandId: string, actorId: string) {
    const created = await this.prisma.contentRequest.create({
      data: {
        brandId,
        requestedById: actorId,
        title: dto.title,
        description: dto.description,
        contentType: dto.contentType,
        channel: dto.channel,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    await this.auditLog.record({
      entityType: 'ContentRequest',
      entityId: created.id,
      actorId,
      action: 'CREATE',
      after: { title: created.title, status: created.status },
    });

    return created;
  }

  /** Every brand member sees every request in the brand — the shared marketing team model (docs/ARCHITECTURE.md), not just what they authored. */
  async findAllForBrand(brandId: string, query: ListContentRequestsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = { brandId, ...(query.status ? { status: query.status } : {}) };

    const [items, total] = await Promise.all([
      this.prisma.contentRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contentRequest.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findByIdForBrand(id: string, brandId: string) {
    const request = await this.prisma.contentRequest.findFirst({ where: { id, brandId } });
    if (!request) {
      throw new NotFoundException(`Content request ${id} not found.`);
    }
    return request;
  }

  /** Editable only while still DRAFT, only by the requester or an org-wide role. */
  async update(id: string, brandId: string, actorId: string, dto: UpdateContentRequestDto) {
    const existing = await this.findByIdForBrand(id, brandId);
    await this.assertCanModify(existing.requestedById, actorId);

    if (existing.status !== ContentRequestStatus.DRAFT) {
      throw new ForbiddenException('Only a DRAFT content request can be edited.');
    }

    const updated = await this.prisma.contentRequest.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.contentType !== undefined ? { contentType: dto.contentType } : {}),
        ...(dto.channel !== undefined ? { channel: dto.channel } : {}),
        ...(dto.dueDate !== undefined ? { dueDate: new Date(dto.dueDate) } : {}),
      },
    });

    await this.auditLog.record({
      entityType: 'ContentRequest',
      entityId: id,
      actorId,
      action: 'UPDATE',
      before: { title: existing.title },
      after: { title: updated.title },
    });

    return updated;
  }

  /** The workflow engine skeleton in action: validated transition + audit trail, only by the requester or an org-wide role. */
  async transition(id: string, brandId: string, actorId: string, toStatus: ContentRequestStatus) {
    const existing = await this.findByIdForBrand(id, brandId);
    await this.assertCanModify(existing.requestedById, actorId);
    assertValidContentRequestTransition(existing.status, toStatus);

    const updated = await this.prisma.contentRequest.update({
      where: { id },
      data: { status: toStatus },
    });

    await this.auditLog.record({
      entityType: 'ContentRequest',
      entityId: id,
      actorId,
      action: 'STATUS_CHANGE',
      before: { status: existing.status },
      after: { status: updated.status },
    });

    return updated;
  }

  private async assertCanModify(requestedById: string, actorId: string): Promise<void> {
    if (requestedById === actorId) return;

    const orgWideAccess = await this.orgAccess.getOrgWideRole(actorId);
    if (!orgWideAccess) {
      throw new ForbiddenException(
        'Only the requester or an org-wide role can modify this request.',
      );
    }
  }
}
