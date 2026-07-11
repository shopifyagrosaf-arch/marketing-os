import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to the given role names (matched against the caller's
 * role for the currently resolved brand — see BrandAccessGuard). Role names
 * are plain strings, not a fixed enum, since Super Admin can create custom
 * roles at runtime (SRS v2 FR: extensible RBAC).
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
