import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

export interface BrandContext {
  brandId: string;
  roleName: string;
  roleId: string;
}

/**
 * Pulls the resolved brand + role for the current request, attached by
 * BrandAccessGuard. Only populated on routes decorated with @UseGuards(BrandAccessGuard).
 */
export const CurrentBrand = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): BrandContext => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.brandContext) {
      // A handler used @CurrentBrand without BrandAccessGuard in its
      // @UseGuards chain — a wiring mistake, not a client error.
      throw new InternalServerErrorException(
        '@CurrentBrand used on a route without BrandAccessGuard.',
      );
    }
    return request.brandContext;
  },
);
