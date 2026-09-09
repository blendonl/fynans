import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  DomainForbiddenException,
  DomainValidationException,
} from '../../../exceptions/domain.exceptions';
import { VerifyFamilyAccessUseCase } from '../../application/use-cases/verify-family-access.use-case';
import { FamilyMemberRole } from '../../domain/family-role';
import { FamilyScopeRule } from '../decorators/requires-family-membership.decorator';
import { FamilyScopeGuard } from './family-scope.guard';

interface FakeRequest {
  method?: string;
  user?: { id: string };
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
}

function contextFor(request: FakeRequest): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => ({ method: 'GET', ...request }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('FamilyScopeGuard', () => {
  let guard: FamilyScopeGuard;
  let reflector: Reflector;
  let execute: jest.Mock;

  function givenRule(rule?: FamilyScopeRule) {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(rule);
  }

  beforeEach(() => {
    reflector = new Reflector();
    execute = jest.fn().mockResolvedValue(undefined);
    guard = new FamilyScopeGuard(reflector, {
      execute,
    } as unknown as VerifyFamilyAccessUseCase);
  });

  it('verifies an undeclared route that still carries a familyId', async () => {
    givenRule(undefined);

    await guard.canActivate(
      contextFor({ user: { id: 'user-a' }, query: { familyId: 'family-1' } }),
    );

    expect(execute).toHaveBeenCalledWith('family-1', 'user-a', undefined);
  });

  it('reads the familyId from a route parameter', async () => {
    givenRule({});

    await guard.canActivate(
      contextFor({ user: { id: 'user-a' }, params: { familyId: 'family-1' } }),
    );

    expect(execute).toHaveBeenCalledWith('family-1', 'user-a', undefined);
  });

  it('reads the familyId from the body', async () => {
    givenRule({});

    await guard.canActivate(
      contextFor({ user: { id: 'user-a' }, body: { familyId: 'family-1' } }),
    );

    expect(execute).toHaveBeenCalledWith('family-1', 'user-a', undefined);
  });

  it('reads a custom key from a declared source', async () => {
    givenRule({ sources: ['param'], key: 'id' });

    await guard.canActivate(
      contextFor({
        user: { id: 'user-a' },
        params: { id: 'family-1' },
        query: { familyId: 'family-2' },
      }),
    );

    expect(execute).toHaveBeenCalledWith('family-1', 'user-a', undefined);
  });

  it('passes the required roles through to the policy', async () => {
    givenRule({ roles: [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN] });

    await guard.canActivate(
      contextFor({ user: { id: 'user-a' }, query: { familyId: 'family-1' } }),
    );

    expect(execute).toHaveBeenCalledWith('family-1', 'user-a', [
      FamilyMemberRole.OWNER,
      FamilyMemberRole.ADMIN,
    ]);
  });

  it('allows a request that carries no familyId', async () => {
    givenRule(undefined);

    await expect(
      guard.canActivate(contextFor({ user: { id: 'user-a' }, query: {} })),
    ).resolves.toBe(true);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects a missing familyId when the route requires one', async () => {
    givenRule({ required: true });

    await expect(
      guard.canActivate(contextFor({ user: { id: 'user-a' }, query: {} })),
    ).rejects.toBeInstanceOf(DomainValidationException);
  });

  it('rejects an unauthenticated request that carries a familyId', async () => {
    givenRule(undefined);

    await expect(
      guard.canActivate(contextFor({ query: { familyId: 'family-1' } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lets a CORS preflight through untouched', async () => {
    givenRule(undefined);

    await expect(
      guard.canActivate(
        contextFor({ method: 'OPTIONS', query: { familyId: 'family-1' } }),
      ),
    ).resolves.toBe(true);
    expect(execute).not.toHaveBeenCalled();
  });

  it('propagates the policy failure', async () => {
    givenRule(undefined);
    const denied = new DomainForbiddenException('Not a member of this family');
    execute.mockRejectedValue(denied);

    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'user-b' }, query: { familyId: 'family-1' } }),
      ),
    ).rejects.toBe(denied);
  });
});
