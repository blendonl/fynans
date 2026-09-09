import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../../core/application/services/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedRequest } from '../../../../common/types/authenticated-request';
import { hasSessionCredentials, toSessionHeaders } from '../http/session-http';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
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

    try {
      const user = await this.authService.validateRequestSession(
        toSessionHeaders(request),
      );
      (request as AuthenticatedRequest).user = user;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return true;
  }
}
