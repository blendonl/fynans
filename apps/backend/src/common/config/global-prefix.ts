import { INestApplication, RequestMethod } from '@nestjs/common';
import { RouteInfo } from '@nestjs/common/interfaces';

export const API_GLOBAL_PREFIX = 'api';

export const GLOBAL_PREFIX_EXCLUDED_ROUTES: RouteInfo[] = [
  { path: 'auth', method: RequestMethod.ALL },
  { path: 'auth/{*path}', method: RequestMethod.ALL },
];

export function applyGlobalPrefix(app: INestApplication): void {
  app.setGlobalPrefix(API_GLOBAL_PREFIX, {
    exclude: GLOBAL_PREFIX_EXCLUDED_ROUTES,
  });
}
