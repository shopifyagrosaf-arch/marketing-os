import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgRoleGuard } from './org-role.guard';
import { OrgAccessService } from '../services/org-access.service';

function buildContext(user: unknown) {
  const request = { user };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('OrgRoleGuard', () => {
  const user = { id: 'u1', email: 'a@b.com', name: 'A', organizationId: 'org1' };

  it('allows the request when no org-wide roles are required', async () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const orgAccess = { getOrgWideRole: jest.fn() } as unknown as OrgAccessService;
    const guard = new OrgRoleGuard(reflector, orgAccess);
    await expect(guard.canActivate(buildContext(user))).resolves.toBe(true);
    expect(orgAccess.getOrgWideRole).not.toHaveBeenCalled();
  });

  it('rejects when there is no authenticated user', async () => {
    const reflector = { getAllAndOverride: () => ['SUPER_ADMIN'] } as unknown as Reflector;
    const orgAccess = { getOrgWideRole: jest.fn() } as unknown as OrgAccessService;
    const guard = new OrgRoleGuard(reflector, orgAccess);
    await expect(guard.canActivate(buildContext(undefined))).rejects.toThrow(ForbiddenException);
  });

  it('rejects when the caller has no org-wide role at all', async () => {
    const reflector = { getAllAndOverride: () => ['SUPER_ADMIN'] } as unknown as Reflector;
    const orgAccess = {
      getOrgWideRole: jest.fn().mockResolvedValue(null),
    } as unknown as OrgAccessService;
    const guard = new OrgRoleGuard(reflector, orgAccess);
    await expect(guard.canActivate(buildContext(user))).rejects.toThrow(ForbiddenException);
  });

  it('rejects when the org-wide role does not match the required set', async () => {
    const reflector = { getAllAndOverride: () => ['SUPER_ADMIN'] } as unknown as Reflector;
    const orgAccess = {
      getOrgWideRole: jest.fn().mockResolvedValue({ roleId: 'r1', roleName: 'MARKETING_HEAD' }),
    } as unknown as OrgAccessService;
    const guard = new OrgRoleGuard(reflector, orgAccess);
    await expect(guard.canActivate(buildContext(user))).rejects.toThrow(ForbiddenException);
  });

  it('allows when the org-wide role matches', async () => {
    const reflector = {
      getAllAndOverride: () => ['SUPER_ADMIN', 'MARKETING_HEAD'],
    } as unknown as Reflector;
    const orgAccess = {
      getOrgWideRole: jest.fn().mockResolvedValue({ roleId: 'r1', roleName: 'MARKETING_HEAD' }),
    } as unknown as OrgAccessService;
    const guard = new OrgRoleGuard(reflector, orgAccess);
    await expect(guard.canActivate(buildContext(user))).resolves.toBe(true);
  });
});
