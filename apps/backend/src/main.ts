import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { BetterAuthProvider } from './feature/auth/core/infrastructure/providers/better-auth.provider';
import { validateEnv } from './common/config/env.validation';

async function bootstrap() {
  const env = validateEnv();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
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
  expressApp.all('/api/auth/*splat', betterAuthHandler);

  await app.listen(env.PORT, '0.0.0.0');
}
bootstrap();
