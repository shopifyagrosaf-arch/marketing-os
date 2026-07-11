import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentBrand, BrandContext } from '../../common/decorators/brand-context.decorator';
import { OrgRoleGuard } from '../../common/guards/org-role.guard';
import { OrgRoles } from '../../common/decorators/org-roles.decorator';
import { BrandAccessGuard } from '../../common/guards/brand-access.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  /** Powers the brand switcher: every brand this user can switch into. */
  @Get('mine')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.brandsService.findMineForUser(user.id, user.organizationId);
  }

  /**
   * Updates the brand currently selected via the `x-brand-id` header. The
   * reference implementation of the brand-scoped RBAC chain: BrandAccessGuard
   * resolves + authorizes the brand, RolesGuard checks the resolved role
   * against @Roles, and the handler only ever sees an already-authorized
   * brand via @CurrentBrand.
   */
  @Patch('mine')
  @UseGuards(BrandAccessGuard, RolesGuard)
  @Roles('BRAND_MANAGER', 'MARKETING_HEAD', 'SUPER_ADMIN')
  updateMine(
    @Body() dto: UpdateBrandDto,
    @CurrentBrand() brand: BrandContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.brandsService.updateForBrandContext(brand.brandId, user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.brandsService.findByIdForUser(id, user.id, user.organizationId);
  }

  @Post()
  @UseGuards(OrgRoleGuard)
  @OrgRoles('SUPER_ADMIN')
  create(@Body() dto: CreateBrandDto, @CurrentUser() user: AuthenticatedUser) {
    return this.brandsService.create(dto, user.organizationId);
  }
}
