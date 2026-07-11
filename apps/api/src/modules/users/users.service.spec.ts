import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

function buildPrismaMock() {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    brand: { findFirst: jest.fn() },
    role: { findUnique: jest.fn() },
    brandAccess: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };
}

function buildAuditLog() {
  return { record: jest.fn().mockResolvedValue(undefined) };
}

describe('UsersService', () => {
  describe('create', () => {
    it('rejects when the email belongs to a user in a different organization', async () => {
      const prisma = buildPrismaMock();
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', organizationId: 'other-org' });
      const service = new UsersService(prisma as any, buildAuditLog() as any);

      await expect(
        service.create({ email: 'a@b.com', name: 'A' } as any, 'org1', 'actor1'),
      ).rejects.toThrow(ConflictException);
    });

    it('is idempotent when the user already exists in this org (does not re-create)', async () => {
      const prisma = buildPrismaMock();
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        organizationId: 'org1',
        email: 'a@b.com',
      });
      const auditLog = buildAuditLog();
      const service = new UsersService(prisma as any, auditLog as any);

      const result = await service.create({ email: 'a@b.com', name: 'A' } as any, 'org1', 'actor1');

      expect(result.id).toBe('u1');
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(auditLog.record).not.toHaveBeenCalled();
    });

    it('creates a new user and grants initial brand access', async () => {
      const prisma = buildPrismaMock();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u2',
        organizationId: 'org1',
        email: 'new@b.com',
      });
      prisma.user.findFirst.mockResolvedValue({ id: 'u2', organizationId: 'org1' });
      prisma.brand.findFirst.mockResolvedValue({ id: 'brand1', organizationId: 'org1' });
      prisma.role.findUnique.mockResolvedValue({
        id: 'role1',
        name: 'CONTENT_WRITER',
        organizationId: null,
      });
      prisma.brandAccess.findUnique.mockResolvedValue(null);
      prisma.brandAccess.create.mockResolvedValue({ id: 'ba1' });
      const auditLog = buildAuditLog();
      const service = new UsersService(prisma as any, auditLog as any);

      await service.create(
        {
          email: 'new@b.com',
          name: 'New',
          brandAccess: [{ brandId: 'brand1', roleId: 'role1' }],
        } as any,
        'org1',
        'actor1',
      );

      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.brandAccess.create).toHaveBeenCalledWith({
        data: { userId: 'u2', brandId: 'brand1', roleId: 'role1' },
      });
    });
  });

  describe('grantBrandAccess', () => {
    it('404s when the brand does not belong to the organization', async () => {
      const prisma = buildPrismaMock();
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', organizationId: 'org1' });
      prisma.brand.findFirst.mockResolvedValue(null);
      const service = new UsersService(prisma as any, buildAuditLog() as any);

      await expect(
        service.grantBrandAccess(
          'u1',
          'org1',
          { brandId: 'brandX', roleId: 'role1' } as any,
          'actor1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('is idempotent — returns the existing grant instead of erroring on duplicate', async () => {
      const prisma = buildPrismaMock();
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', organizationId: 'org1' });
      prisma.brand.findFirst.mockResolvedValue({ id: 'brand1' });
      prisma.role.findUnique.mockResolvedValue({
        id: 'role1',
        name: 'CONTENT_WRITER',
        organizationId: null,
      });
      prisma.brandAccess.findUnique.mockResolvedValue({ id: 'existing-ba' });
      const auditLog = buildAuditLog();
      const service = new UsersService(prisma as any, auditLog as any);

      const result = await service.grantBrandAccess(
        'u1',
        'org1',
        { brandId: 'brand1', roleId: 'role1' } as any,
        'actor1',
      );

      expect(result.id).toBe('existing-ba');
      expect(prisma.brandAccess.create).not.toHaveBeenCalled();
      expect(auditLog.record).not.toHaveBeenCalled();
    });

    it('404s when the role belongs to a different organization', async () => {
      const prisma = buildPrismaMock();
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', organizationId: 'org1' });
      prisma.brand.findFirst.mockResolvedValue({ id: 'brand1', organizationId: 'org1' });
      prisma.role.findUnique.mockResolvedValue({
        id: 'role1',
        name: 'REGIONAL_LEAD',
        organizationId: 'org2', // a different organization's custom role
      });
      const service = new UsersService(prisma as any, buildAuditLog() as any);

      await expect(
        service.grantBrandAccess(
          'u1',
          'org1',
          { brandId: 'brand1', roleId: 'role1' } as any,
          'actor1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('revokeBrandAccess', () => {
    it('404s when the grant does not belong to this user', async () => {
      const prisma = buildPrismaMock();
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', organizationId: 'org1' });
      prisma.brandAccess.findFirst.mockResolvedValue(null);
      const service = new UsersService(prisma as any, buildAuditLog() as any);

      await expect(service.revokeBrandAccess('u1', 'org1', 'ba1', 'actor1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
