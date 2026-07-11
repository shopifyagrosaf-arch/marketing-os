import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { OrgRoleGuard } from '../../common/guards/org-role.guard';
import { OrgRoles } from '../../common/decorators/org-roles.decorator';

@Controller('roles')
@UseGuards(OrgRoleGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @OrgRoles('SUPER_ADMIN', 'MARKETING_HEAD')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.findAll(user.organizationId);
  }

  @Get(':id')
  @OrgRoles('SUPER_ADMIN', 'MARKETING_HEAD')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.findById(id, user.organizationId);
  }

  /** Custom roles only — the 14 seeded built-in roles are immutable via API (see RolesService). */
  @Post()
  @OrgRoles('SUPER_ADMIN')
  create(@Body() dto: CreateRoleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.create(dto, user.organizationId, user.id);
  }

  @Patch(':id')
  @OrgRoles('SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.update(id, user.organizationId, dto, user.id);
  }

  @Delete(':id')
  @OrgRoles('SUPER_ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.remove(id, user.organizationId, user.id);
  }
}
