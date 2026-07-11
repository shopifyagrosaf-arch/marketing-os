import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { OrgRoleGuard } from '../../common/guards/org-role.guard';
import { OrgRoles } from '../../common/decorators/org-roles.decorator';

@Controller('permissions')
@UseGuards(OrgRoleGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @OrgRoles('SUPER_ADMIN', 'MARKETING_HEAD')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Post()
  @OrgRoles('SUPER_ADMIN')
  create(@Body() dto: CreatePermissionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.permissionsService.create(dto, user.id);
  }
}
