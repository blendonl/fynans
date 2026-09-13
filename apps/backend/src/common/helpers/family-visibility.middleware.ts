import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { runWithFamilyVisibilityCache } from './family-visibility.cache';

@Injectable()
export class FamilyVisibilityCacheMiddleware implements NestMiddleware {
  use(_req: Request, _res: Response, next: NextFunction): void {
    runWithFamilyVisibilityCache(() => next());
  }
}
