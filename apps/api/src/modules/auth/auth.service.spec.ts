import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('returns the existing active user without creating a new row', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1',
          email: 'a@agrosaf.com',
          name: 'A',
          organizationId: 'org1',
          status: 'ACTIVE',
        }),
        create: jest.fn(),
      },
      organization: { findFirstOrThrow: jest.fn() },
    } as any;

    const service = new AuthService(prisma);
    const result = await service.validateOrCreateUser({
      sub: 'sso-1',
      email: 'a@agrosaf.com',
      name: 'A',
    });

    expect(result.id).toBe('u1');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects login for a suspended/expired user', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1',
          email: 'a@agrosaf.com',
          status: 'SUSPENDED',
        }),
      },
    } as any;

    const service = new AuthService(prisma);
    await expect(
      service.validateOrCreateUser({ sub: 'sso-1', email: 'a@agrosaf.com', name: 'A' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('provisions a new user under the default organization on first login', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'u2',
          email: 'new@agrosaf.com',
          name: 'New Person',
          organizationId: 'org1',
        }),
      },
      organization: {
        findFirstOrThrow: jest.fn().mockResolvedValue({ id: 'org1' }),
      },
    } as any;

    const service = new AuthService(prisma);
    const result = await service.validateOrCreateUser({
      sub: 'sso-2',
      email: 'new@agrosaf.com',
      name: 'New Person',
    });

    expect(result.organizationId).toBe('org1');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: 'new@agrosaf.com' }) }),
    );
  });
});
