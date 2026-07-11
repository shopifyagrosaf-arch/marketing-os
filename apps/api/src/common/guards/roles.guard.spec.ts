import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function buildContext(brandContext: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ brandContext }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows the request when no roles are required', () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(buildContext(undefined))).toBe(true);
  });

  it('throws if no brand context was resolved before this guard runs', () => {
    const reflector = { getAllAndOverride: () => ['BRAND_MANAGER'] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(buildContext(undefined))).toThrow(ForbiddenException);
  });

  it('allows a matching role', () => {
    const reflector = { getAllAndOverride: () => ['BRAND_MANAGER'] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const ctx = buildContext({ brandId: 'b1', roleId: 'r1', roleName: 'BRAND_MANAGER' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects a non-matching role', () => {
    const reflector = { getAllAndOverride: () => ['BRAND_MANAGER'] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const ctx = buildContext({ brandId: 'b1', roleId: 'r2', roleName: 'CONTENT_WRITER' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
