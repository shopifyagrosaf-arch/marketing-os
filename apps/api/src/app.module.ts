import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { BrandsModule } from './modules/brands/brands.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UsersModule } from './modules/users/users.module';
import { ContentRequestsModule } from './modules/content-requests/content-requests.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        // Generous default; endpoints that need tighter limits (e.g. login)
        // can override with @Throttle() once Sprint 2 adds them.
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    CommonModule,
    AuthModule,
    OrganizationsModule,
    BrandsModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    ContentRequestsModule,
    HealthModule,
  ],
  providers: [
    // Applied to every route by default; use @Public() to opt out.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Runs after JwtAuthGuard in the chain (Nest evaluates APP_GUARD
    // providers in registration order) — rate-limits by IP regardless of
    // auth outcome, to blunt brute-force/DoS attempts.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
