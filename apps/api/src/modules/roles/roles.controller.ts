import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { OrgRoleGuard } from '../../common/guards/org-role.guard';
import { OrgRoles } from '../../common/decorators/org-roles.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @UseGuards(OrgRoleGuard)
  @OrgRoles('SUPER_ADMIN', 'MARKETING_HEAD')
  findAll() {
    return this.rolesService.findAll();
  }
}
