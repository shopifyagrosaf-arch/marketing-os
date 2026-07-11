import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

export interface AuthJsTokenPayload {
  sub: string; // provider subject id
  email: string;
  name: string;
}

/**
 * Validates the JWT issued by Auth.js on the Next.js side. Both apps share
 * AUTH_SECRET (HS256) so the API can verify the session token without
 * calling back into the web app.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('AUTH_SECRET'),
    });
  }

  async validate(payload: AuthJsTokenPayload) {
    if (!payload?.email) {
      throw new UnauthorizedException('Invalid token payload.');
    }
    return this.authService.validateOrCreateUser(payload);
  }
}
