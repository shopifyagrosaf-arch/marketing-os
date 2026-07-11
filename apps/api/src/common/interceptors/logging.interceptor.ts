import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logs method, path, resolved brand (if any), and duration for every
 * request — the minimum needed to trace an approval/rejection back to who
 * did what, ahead of the full audit-log-backed workflow engine landing in
 * later sprints.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const brandId = request.brandContext?.brandId;
          const userId = request.user?.id;
          this.logger.log(
            `${method} ${originalUrl} ${Date.now() - start}ms` +
              (userId ? ` user=${userId}` : '') +
              (brandId ? ` brand=${brandId}` : ''),
          );
        },
        error: (err) => {
          this.logger.warn(
            `${method} ${originalUrl} ${Date.now() - start}ms failed: ${err.message}`,
          );
        },
      }),
    );
  }
}
