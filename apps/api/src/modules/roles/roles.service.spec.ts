import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RolesService } from './roles.service';

const ORG_1 = 'org1';
const ORG_2 = 'org2';

function buildPrismaMock(overrides: Record<string, unknown> = {}) {
  return {
    role: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    permission: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    brandAccess: {
      count: jest.fn().mockResolvedValue(0),
    },
    rolePermission: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(async (cb: (tx: unknown) => unknown) => cb(overrides)),
    ...overrides,
  };
}

function buildAuditLog() {
  return { record: jest.fn().mockResolvedValue(undefined) };
}

describe('RolesService', () => {
  describe('create', () => {
    it('rejects a duplicate role name', async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue({ id: 'r1', name: 'BRAND_MANAGER' });
      const service = new RolesService(prisma as any, buildAuditLog() as any);

      await expect(
        service.create({ name: 'BRAND_MANAGER' } as any, ORG_1, 'actor1'),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects unknown permission actions', async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue(null);
      prisma.permission.findMany.mockResolvedValue([]); // none of the requested actions exist
      const service = new RolesService(prisma as any, buildAuditLog() as any);

      await expect(
        service.create(
          { name: 'REGIONAL_LEAD', permissionActions: ['content:approve'] } as any,
          ORG_1,
          'actor1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a custom role scoped to the caller organization', async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique
        .mockResolvedValueOnce(null) // duplicate-name check
        .mockResolvedValueOnce({
          id: 'r1',
          name: 'REGIONAL_LEAD',
          isCustom: true,
          isOrgWide: false,
          organizationId: ORG_1,
          permissions: [],
        }); // findById after create
      prisma.permission.findMany.mockResolvedValue([{ id: 'p1', action: 'content:approve' }]);
      prisma.role.create.mockResolvedValue({ id: 'r1', name: 'REGIONAL_LEAD' });
      const auditLog = buildAuditLog();
      const service = new RolesService(prisma as any, auditLog as any);

      const result = await service.create(
        { name: 'REGIONAL_LEAD', permissionActions: ['content:approve'] } as any,
        ORG_1,
        'actor1',
      );

      expect(result.name).toBe('REGIONAL_LEAD');
      expect(prisma.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isCustom: true, organizationId: ORG_1 }),
        }),
      );
      expect(auditLog.record).toHaveBeenCalled();
    });
  });

  describe('cross-organization isolation', () => {
    it("findById 404s (not 403) on another organization's custom role", async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue({
        id: 'r1',
        name: 'REGIONAL_LEAD',
        isCustom: true,
        organizationId: ORG_2,
        permissions: [],
      });
      const service = new RolesService(prisma as any, buildAuditLog() as any);

      await expect(service.findById('r1', ORG_1)).rejects.toThrow(NotFoundException);
    });

    it('findById succeeds for a global (organizationId null) role regardless of caller org', async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue({
        id: 'r1',
        name: 'SUPER_ADMIN',
        isCustom: false,
        organizationId: null,
        permissions: [],
      });
      const service = new RolesService(prisma as any, buildAuditLog() as any);

      await expect(service.findById('r1', ORG_1)).resolves.toMatchObject({ name: 'SUPER_ADMIN' });
    });

    it("refuses to update another organization's custom role", async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue({
        id: 'r1',
        name: 'REGIONAL_LEAD',
        isCustom: true,
        organizationId: ORG_2,
      });
      const service = new RolesService(prisma as any, buildAuditLog() as any);

      await expect(service.update('r1', ORG_1, { name: 'X' } as any, 'actor1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('mustBeCustom protection (update/remove)', () => {
    it('refuses to update a built-in role', async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue({
        id: 'r1',
        name: 'SUPER_ADMIN',
        isCustom: false,
        organizationId: null,
      });
      const service = new RolesService(prisma as any, buildAuditLog() as any);

      await expect(service.update('r1', ORG_1, { name: 'X' } as any, 'actor1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('refuses to delete a built-in role', async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue({
        id: 'r1',
        name: 'SUPER_ADMIN',
        isCustom: false,
        organizationId: null,
      });
      const service = new RolesService(prisma as any, buildAuditLog() as any);

      await expect(service.remove('r1', ORG_1, 'actor1')).rejects.toThrow(ForbiddenException);
    });

    it('404s on an unknown role id', async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue(null);
      const service = new RolesService(prisma as any, buildAuditLog() as any);

      await expect(service.remove('missing', ORG_1, 'actor1')).rejects.toThrow(NotFoundException);
    });

    it('refuses to delete a custom role still assigned to users', async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue({
        id: 'r1',
        name: 'REGIONAL_LEAD',
        isCustom: true,
        organizationId: ORG_1,
      });
      prisma.brandAccess.count.mockResolvedValue(3);
      const service = new RolesService(prisma as any, buildAuditLog() as any);

      await expect(service.remove('r1', ORG_1, 'actor1')).rejects.toThrow(ConflictException);
    });

    it('deletes an unused custom role owned by the caller organization', async () => {
      const prisma = buildPrismaMock();
      prisma.role.findUnique.mockResolvedValue({
        id: 'r1',
        name: 'REGIONAL_LEAD',
        isCustom: true,
        organizationId: ORG_1,
      });
      prisma.brandAccess.count.mockResolvedValue(0);
      const auditLog = buildAuditLog();
      const service = new RolesService(prisma as any, auditLog as any);

      await service.remove('r1', ORG_1, 'actor1');

      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
      expect(auditLog.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE' }));
    });
  });
});
