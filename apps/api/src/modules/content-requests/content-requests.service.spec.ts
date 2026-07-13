import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ContentRequestStatus } from '@prisma/client';
import { ContentRequestsService } from './content-requests.service';

function buildPrismaMock() {
  return {
    contentRequest: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };
}

function buildAuditLog() {
  return { record: jest.fn().mockResolvedValue(undefined) };
}

function buildOrgAccess(orgWideRole: unknown = null) {
  return { getOrgWideRole: jest.fn().mockResolvedValue(orgWideRole) };
}

describe('ContentRequestsService', () => {
  describe('create', () => {
    it('creates a DRAFT request scoped to the resolved brand and requester, and audits it', async () => {
      const prisma = buildPrismaMock();
      prisma.contentRequest.create.mockResolvedValue({
        id: 'cr1',
        title: 'New landing page copy',
        status: ContentRequestStatus.DRAFT,
      });
      const auditLog = buildAuditLog();
      const service = new ContentRequestsService(
        prisma as any,
        auditLog as any,
        buildOrgAccess() as any,
      );

      await service.create(
        { title: 'New landing page copy', contentType: 'website_copy' } as any,
        'brand1',
        'user1',
      );

      expect(prisma.contentRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ brandId: 'brand1', requestedById: 'user1' }),
        }),
      );
      expect(auditLog.record).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'ContentRequest', action: 'CREATE' }),
      );
    });
  });

  describe('findByIdForBrand', () => {
    it('404s when the request does not belong to the given brand', async () => {
      const prisma = buildPrismaMock();
      prisma.contentRequest.findFirst.mockResolvedValue(null);
      const service = new ContentRequestsService(
        prisma as any,
        buildAuditLog() as any,
        buildOrgAccess() as any,
      );

      await expect(service.findByIdForBrand('cr1', 'brand1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('rejects editing a request that is no longer DRAFT', async () => {
      const prisma = buildPrismaMock();
      prisma.contentRequest.findFirst.mockResolvedValue({
        id: 'cr1',
        requestedById: 'user1',
        status: ContentRequestStatus.SUBMITTED,
      });
      const service = new ContentRequestsService(
        prisma as any,
        buildAuditLog() as any,
        buildOrgAccess() as any,
      );

      await expect(
        service.update('cr1', 'brand1', 'user1', { title: 'Edited' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects a user who is neither the requester nor org-wide', async () => {
      const prisma = buildPrismaMock();
      prisma.contentRequest.findFirst.mockResolvedValue({
        id: 'cr1',
        requestedById: 'user1',
        status: ContentRequestStatus.DRAFT,
      });
      const service = new ContentRequestsService(
        prisma as any,
        buildAuditLog() as any,
        buildOrgAccess(null) as any,
      );

      await expect(
        service.update('cr1', 'brand1', 'someone-else', { title: 'Edited' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows an org-wide role to edit a DRAFT request they did not author', async () => {
      const prisma = buildPrismaMock();
      prisma.contentRequest.findFirst.mockResolvedValue({
        id: 'cr1',
        requestedById: 'user1',
        status: ContentRequestStatus.DRAFT,
        title: 'Old title',
      });
      prisma.contentRequest.update.mockResolvedValue({ id: 'cr1', title: 'New title' });
      const service = new ContentRequestsService(
        prisma as any,
        buildAuditLog() as any,
        buildOrgAccess({ roleId: 'r1', roleName: 'MARKETING_HEAD' }) as any,
      );

      const result = await service.update('cr1', 'brand1', 'marketing-head-1', {
        title: 'New title',
      } as any);

      expect(result.title).toBe('New title');
    });
  });

  describe('transition', () => {
    it('rejects an illegal transition (e.g. CANCELLED -> SUBMITTED)', async () => {
      const prisma = buildPrismaMock();
      prisma.contentRequest.findFirst.mockResolvedValue({
        id: 'cr1',
        requestedById: 'user1',
        status: ContentRequestStatus.CANCELLED,
      });
      const service = new ContentRequestsService(
        prisma as any,
        buildAuditLog() as any,
        buildOrgAccess() as any,
      );

      await expect(
        service.transition('cr1', 'brand1', 'user1', ContentRequestStatus.SUBMITTED),
      ).rejects.toThrow(BadRequestException);
    });

    it('applies a legal transition and audits the status change', async () => {
      const prisma = buildPrismaMock();
      prisma.contentRequest.findFirst.mockResolvedValue({
        id: 'cr1',
        requestedById: 'user1',
        status: ContentRequestStatus.DRAFT,
      });
      prisma.contentRequest.update.mockResolvedValue({
        id: 'cr1',
        status: ContentRequestStatus.SUBMITTED,
      });
      const auditLog = buildAuditLog();
      const service = new ContentRequestsService(
        prisma as any,
        auditLog as any,
        buildOrgAccess() as any,
      );

      const result = await service.transition(
        'cr1',
        'brand1',
        'user1',
        ContentRequestStatus.SUBMITTED,
      );

      expect(result.status).toBe(ContentRequestStatus.SUBMITTED);
      expect(auditLog.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'STATUS_CHANGE' }),
      );
    });

    it('rejects a non-requester, non-org-wide user from transitioning the request', async () => {
      const prisma = buildPrismaMock();
      prisma.contentRequest.findFirst.mockResolvedValue({
        id: 'cr1',
        requestedById: 'user1',
        status: ContentRequestStatus.DRAFT,
      });
      const service = new ContentRequestsService(
        prisma as any,
        buildAuditLog() as any,
        buildOrgAccess(null) as any,
      );

      await expect(
        service.transition('cr1', 'brand1', 'someone-else', ContentRequestStatus.CANCELLED),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
