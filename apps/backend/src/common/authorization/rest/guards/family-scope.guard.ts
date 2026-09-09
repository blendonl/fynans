import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DomainValidationException } from '../../../exceptions/domain.exceptions';
import { AuthenticatedRequest } from '../../../types/authenticated-request';
import { VerifyFamilyAccessUseCase } from '../../application/use-cases/verify-family-access.use-case';
import {
  DEFAULT_FAMILY_ID_KEY,
  DEFAULT_FAMILY_ID_SOURCES,
  FAMILY_SCOPE_KEY,
  FamilyIdSource,
  FamilyScopeRule,
} from '../decorators/requires-family-membership.decorator';

@Injectable()
export class FamilyScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifyFamilyAccessUseCase: VerifyFamilyAccessUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.method === 'OPTIONS') {
      return true;
    }

    const rule = this.reflector.getAllAndOverride<FamilyScopeRule | undefined>(
      FAMILY_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const familyId = this.readFamilyId(request, rule);

    if (!familyId) {
      if (rule?.required) {
        throw new DomainValidationException(
          `${rule.key ?? DEFAULT_FAMILY_ID_KEY} is required`,
        );
      }
      return true;
    }

    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    await this.verifyFamilyAccessUseCase.execute(familyId, userId, rule?.roles);

    return true;
  }

  private readFamilyId(
    request: AuthenticatedRequest,
    rule?: FamilyScopeRule,
  ): string | undefined {
    const key = rule?.key ?? DEFAULT_FAMILY_ID_KEY;
    const sources = rule?.sources ?? DEFAULT_FAMILY_ID_SOURCES;

    for (const source of sources) {
      const value = this.containerFor(request, source)?.[key];

      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
    }

    return undefined;
  }

  private containerFor(
    request: AuthenticatedRequest,
    source: FamilyIdSource,
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
