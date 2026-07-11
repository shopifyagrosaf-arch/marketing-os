import { Controller, Get } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { OrgAccessService } from '../../common/services/org-access.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly orgAccess: OrgAccessService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const orgWideRole = await this.orgAccess.getOrgWideRole(user.id);
    return { ...user, orgRole: orgWideRole?.roleName ?? null };
  }
}
