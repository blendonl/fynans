import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { BetterAuthProvider } from './feature/auth/core/infrastructure/providers/better-auth.provider';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const betterAuthProvider = app.get(BetterAuthProvider);
  const betterAuthHandler = toNodeHandler(betterAuthProvider.auth);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.all('/api/auth/*splat', betterAuthHandler);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
