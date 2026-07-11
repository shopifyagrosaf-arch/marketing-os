import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { OrgRoleGuard } from '../../common/guards/org-role.guard';
import { OrgRoles } from '../../common/decorators/org-roles.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  getMyOrganization(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.findById(user.organizationId);
  }

  @Patch('me')
  @UseGuards(OrgRoleGuard)
  @OrgRoles('SUPER_ADMIN')
  updateMyOrganization(@Body() dto: UpdateOrganizationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.update(user.organizationId, dto, user.id);
  }
}
