import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.use(helmet());

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // Strips unknown properties and rejects requests that don't match a DTO's
  // shape — the primary input-validation boundary for every controller.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = config.get<string>('API_PORT', '3001');
  await app.listen(port);
  logger.log(`API listening on port ${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console -- Logger isn't guaranteed to be set up yet if bootstrap fails early.
  console.error('Fatal error during bootstrap', err);
  process.exit(1);
});
