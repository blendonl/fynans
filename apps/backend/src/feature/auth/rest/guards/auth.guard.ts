import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../../core/application/services/auth.service';
import { SessionCacheService } from '../../core/application/services/session-cache.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedRequest } from '../../../../common/types/authenticated-request';
import {
  hasSessionCredentials,
  sessionCacheKey,
  toSessionHeaders,
} from '../http/session-http';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionCache: SessionCacheService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();

    if (request.method === 'OPTIONS' || isPublic) {
      return true;
    }

    if (!hasSessionCredentials(request)) {
      throw new UnauthorizedException('Authentication required');
    }

    const cacheKey = sessionCacheKey(request);

    if (cacheKey) {
      const cached = await this.sessionCache.get(cacheKey);

      if (cached) {
        (request as AuthenticatedRequest).user = cached;
        return true;
      }
    }

    let user;
    try {
      user = await this.authService.validateRequestSession(
        toSessionHeaders(request),
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    (request as AuthenticatedRequest).user = user;

    if (cacheKey) {
      await this.sessionCache.set(cacheKey, user);
    }

    return true;
  }
}
