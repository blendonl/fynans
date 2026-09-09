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

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const cached = await this.sessionCache.get(token);

    if (cached) {
      (request as AuthenticatedRequest).user = cached;
      return true;
    }

    let user;
    try {
      user = await this.authService.validateSession(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    (request as AuthenticatedRequest).user = user;
    await this.sessionCache.set(token, user);

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
