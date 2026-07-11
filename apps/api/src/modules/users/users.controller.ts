import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { GrantBrandAccessDto } from './dto/grant-brand-access.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { OrgRoleGuard } from '../../common/guards/org-role.guard';
import { OrgRoles } from '../../common/decorators/org-roles.decorator';

/**
 * Every route here is org-wide admin territory (not brand-scoped), so all
 * of them go through OrgRoleGuard rather than BrandAccessGuard/RolesGuard.
 * Reads are open to Super Admin + Marketing Head (matches the SRS's
 * "Marketing Head: dashboard & analytics" visibility); writes are
 * Super-Admin-only (matches "Super Admin: manage users, permissions").
 */
@Controller('users')
@UseGuards(OrgRoleGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @OrgRoles('SUPER_ADMIN', 'MARKETING_HEAD')
  findAll(@Query() query: ListUsersQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAllForOrg(user.organizationId, query);
  }

  @Get(':id')
  @OrgRoles('SUPER_ADMIN', 'MARKETING_HEAD')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findByIdForOrg(id, user.organizationId);
  }

  @Post()
  @OrgRoles('SUPER_ADMIN')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.create(dto, user.organizationId, user.id);
  }

  @Patch(':id')
  @OrgRoles('SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.update(id, user.organizationId, dto, user.id);
  }

  @Patch(':id/status')
  @OrgRoles('SUPER_ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.updateStatus(id, user.organizationId, dto, user.id);
  }

  @Get(':id/brand-access')
  @OrgRoles('SUPER_ADMIN', 'MARKETING_HEAD')
  listBrandAccess(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.listBrandAccess(id, user.organizationId);
  }

  @Post(':id/brand-access')
  @OrgRoles('SUPER_ADMIN')
  grantBrandAccess(
    @Param('id') id: string,
    @Body() dto: GrantBrandAccessDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.grantBrandAccess(id, user.organizationId, dto, user.id);
  }

  @Delete(':id/brand-access/:brandAccessId')
  @OrgRoles('SUPER_ADMIN')
  revokeBrandAccess(
    @Param('id') id: string,
    @Param('brandAccessId') brandAccessId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.revokeBrandAccess(id, user.organizationId, brandAccessId, user.id);
  }
}
