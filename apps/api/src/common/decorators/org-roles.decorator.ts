import { SetMetadata } from '@nestjs/common';

export const ORG_ROLES_KEY = 'orgRoles';

/**
 * Restricts a route to callers holding one of the given ORG-WIDE roles
 * (e.g. Super Admin, Marketing Head) — for actions that aren't scoped to
 * a single brand, such as creating a new brand. Use @Roles + BrandAccessGuard
 * instead for brand-scoped actions.
 */
export const OrgRoles = (...roles: string[]) => SetMetadata(ORG_ROLES_KEY, roles);
