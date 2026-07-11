import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthJsTokenPayload } from './strategies/jwt.strategy';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds the User row for a validated SSO identity, creating it on first
   * login. Sprint 1 has exactly one Organization (Agrosaf Group), so every
   * new user is attached to it; once this becomes a multi-company SaaS
   * product (SRS v2 A11), org resolution needs to move to an invite/domain
   * lookup instead of "the only org that exists."
   */
  async validateOrCreateUser(payload: AuthJsTokenPayload): Promise<AuthenticatedUser> {
    const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      if (existing.status !== 'ACTIVE') {
        this.logger.warn(
          `Login rejected for non-active user ${payload.email} (${existing.status})`,
        );
        throw new UnauthorizedException('Account is not active.');
      }
      return {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        organizationId: existing.organizationId,
      };
    }

    const defaultOrg = await this.prisma.organization.findFirstOrThrow();
    const created = await this.prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name ?? payload.email,
        authProviderId: payload.sub,
        organizationId: defaultOrg.id,
      },
    });

    this.logger.log(`Provisioned new user ${created.email} on first SSO login.`);
    return {
      id: created.id,
      email: created.email,
      name: created.name,
      organizationId: created.organizationId,
    };
  }
}
