import { BadRequestException, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { BrandAccessGuard } from './brand-access.guard';

function buildContext(user: unknown, headers: Record<string, string>) {
  const request: any = { user, headers };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    _request: request,
  };
}

describe('BrandAccessGuard', () => {
  const user = { id: 'u1', email: 'a@b.com', name: 'A', organizationId: 'org1' };

  it('rejects when the x-brand-id header is missing', async () => {
    const prisma = {} as any;
    const guard = new BrandAccessGuard(prisma);
    const ctx = buildContext(user, {});
    await expect(guard.canActivate(ctx as unknown as ExecutionContext)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects when the brand does not belong to the caller organization', async () => {
    const prisma = { brand: { findFirst: jest.fn().mockResolvedValue(null) } } as any;
    const guard = new BrandAccessGuard(prisma);
    const ctx = buildContext(user, { 'x-brand-id': 'brand1' });
    await expect(guard.canActivate(ctx as unknown as ExecutionContext)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('grants access and attaches brandContext on direct BrandAccess', async () => {
    const prisma = {
      brand: { findFirst: jest.fn().mockResolvedValue({ id: 'brand1' }) },
      brandAccess: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({ roleId: 'r1', role: { name: 'BRAND_MANAGER' } }),
      },
    } as any;
    const guard = new BrandAccessGuard(prisma);
    const ctx = buildContext(user, { 'x-brand-id': 'brand1' });
    const result = await guard.canActivate(ctx as unknown as ExecutionContext);
    expect(result).toBe(true);
    expect((ctx as any)._request.brandContext).toEqual({
      brandId: 'brand1',
      roleId: 'r1',
      roleName: 'BRAND_MANAGER',
    });
  });

  it('falls back to an org-wide role when there is no direct BrandAccess row', async () => {
    const prisma = {
      brand: { findFirst: jest.fn().mockResolvedValue({ id: 'brand1' }) },
      brandAccess: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(null) // no direct access
          .mockResolvedValueOnce({ roleId: 'r-super', role: { name: 'SUPER_ADMIN' } }),
      },
    } as any;
    const guard = new BrandAccessGuard(prisma);
    const ctx = buildContext(user, { 'x-brand-id': 'brand1' });
    const result = await guard.canActivate(ctx as unknown as ExecutionContext);
    expect(result).toBe(true);
    expect((ctx as any)._request.brandContext.roleName).toBe('SUPER_ADMIN');
  });

  it('rejects when neither direct nor org-wide access exists', async () => {
    const prisma = {
      brand: { findFirst: jest.fn().mockResolvedValue({ id: 'brand1' }) },
      brandAccess: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    } as any;
    const guard = new BrandAccessGuard(prisma);
    const ctx = buildContext(user, { 'x-brand-id': 'brand1' });
    await expect(guard.canActivate(ctx as unknown as ExecutionContext)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
