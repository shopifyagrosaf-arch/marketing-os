import { Controller, Get } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  getMyOrganization(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.findById(user.organizationId);
  }
}
