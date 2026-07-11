import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
}

/** Pulls the authenticated user attached by JwtAuthGuard onto the request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) {
      // Indicates a route accidentally omitted JwtAuthGuard (e.g. via @Public()
      // on a handler that still uses @CurrentUser) — fail loudly, not with
      // a confusing "cannot read property of undefined" downstream.
      throw new UnauthorizedException('No authenticated user on this request.');
    }
    return request.user;
  },
);
