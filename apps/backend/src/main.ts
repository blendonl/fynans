import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import { AppModule } from './app.module';
import { BetterAuthProvider } from './feature/auth/core/infrastructure/providers/better-auth.provider';
import { validateEnv } from './common/config/env.validation';

async function bootstrap() {
  const env = validateEnv();

  const app = await NestFactory.create(AppModule);

  const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  const corsOptions = {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.enableCors(corsOptions);

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fynans API')
    .setDescription('Fynans personal finance API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .build();

  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const betterAuthProvider = app.get(BetterAuthProvider);
  const betterAuthHandler = toNodeHandler(betterAuthProvider.auth);

  const expressApp = app.getHttpAdapter().getInstance();

  // Apply CORS middleware directly on the Express app for auth routes.
  // The better-auth handler is mounted outside NestJS's router, so we
  // must ensure the cors middleware runs before it to handle preflight
  // (OPTIONS) requests correctly.
  expressApp.use('/api/auth', cors(corsOptions));

  // Express 5 + path-to-regexp v8: use {*path} instead of the Express 4
  // *splat syntax to capture all remaining path segments.
  expressApp.all('/api/auth/{*path}', betterAuthHandler);

  await app.listen(env.PORT, '0.0.0.0');
}
bootstrap();
