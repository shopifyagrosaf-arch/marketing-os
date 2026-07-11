import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { BrandContext } from '../common/decorators/brand-context.decorator';

/**
 * `@types/passport` already declares `Request.user?: Express.User` (an
 * empty interface meant for exactly this kind of augmentation) — so we
 * extend `Express.User` to match our shape rather than redeclaring
 * `Request.user` with an unrelated type, which would conflict with the
 * upstream declaration instead of merging with it.
 *
 * `brandContext` (attached by BrandAccessGuard) has no upstream type, so
 * it's added directly to `Request`.
 */
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends AuthenticatedUser {}
  }
  namespace Express {
    interface Request {
      brandContext?: BrandContext;
    }
  }
}

export {};
