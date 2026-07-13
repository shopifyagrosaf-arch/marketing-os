import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ContentRequestsService } from './content-requests.service';
import { CreateContentRequestDto } from './dto/create-content-request.dto';
import { UpdateContentRequestDto } from './dto/update-content-request.dto';
import { UpdateContentRequestStatusDto } from './dto/update-content-request-status.dto';
import { ListContentRequestsQueryDto } from './dto/list-content-requests-query.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentBrand, BrandContext } from '../../common/decorators/brand-context.decorator';
import { BrandAccessGuard } from '../../common/guards/brand-access.guard';

/**
 * Every route here resolves the target brand from the `x-brand-id` header
 * via BrandAccessGuard (see docs/ARCHITECTURE.md) — no @Roles restriction on
 * top of it: intake is intentionally open to any role with access to the
 * brand, not gated to a specific role list the way admin-only endpoints are.
 */
@Controller('content-requests')
@UseGuards(BrandAccessGuard)
export class ContentRequestsController {
  constructor(private readonly contentRequestsService: ContentRequestsService) {}

  @Get()
  findAll(@Query() query: ListContentRequestsQueryDto, @CurrentBrand() brand: BrandContext) {
    return this.contentRequestsService.findAllForBrand(brand.brandId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentBrand() brand: BrandContext) {
    return this.contentRequestsService.findByIdForBrand(id, brand.brandId);
  }

  @Post()
  create(
    @Body() dto: CreateContentRequestDto,
    @CurrentBrand() brand: BrandContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentRequestsService.create(dto, brand.brandId, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContentRequestDto,
    @CurrentBrand() brand: BrandContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentRequestsService.update(id, brand.brandId, user.id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContentRequestStatusDto,
    @CurrentBrand() brand: BrandContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contentRequestsService.transition(id, brand.brandId, user.id, dto.status);
  }
}
