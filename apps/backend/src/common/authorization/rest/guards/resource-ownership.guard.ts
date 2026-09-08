import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DomainValidationException } from '../../../exceptions/domain.exceptions';
import { AuthenticatedRequest } from '../../../types/authenticated-request';
import { VerifyResourceAccessUseCase } from '../../application/use-cases/verify-resource-access.use-case';
import {
  OWNS_RESOURCE_KEY,
  OwnsResourceRule,
  ResourceIdSource,
} from '../decorators/owns-resource.decorator';

@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifyResourceAccessUseCase: VerifyResourceAccessUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules = this.reflector.getAllAndOverride<OwnsResourceRule[]>(
      OWNS_RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rules?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    for (const rule of rules) {
      const resourceId = this.readResourceId(request, rule);

      if (!resourceId) {
        if (rule.optional) {
          continue;
        }
        throw new DomainValidationException(`${rule.key ?? 'id'} is required`);
      }

      await this.verifyResourceAccessUseCase.execute(
        rule.resource,
        resourceId,
        userId,
      );
    }

    return true;
  }

  private readResourceId(
    request: AuthenticatedRequest,
    rule: OwnsResourceRule,
  ): string | undefined {
    const container = this.containerFor(request, rule.source ?? 'param');
    const value = container?.[rule.key ?? 'id'];

    return typeof value === 'string' && value.trim() !== '' ? value : undefined;
  }

  private containerFor(
    request: AuthenticatedRequest,
    source: ResourceIdSource,
  ): Record<string, unknown> | undefined {
    switch (source) {
      case 'param':
        return request.params as Record<string, unknown>;
      case 'query':
        return request.query as Record<string, unknown>;
      case 'body':
        return request.body as Record<string, unknown>;
    }
  }
}
