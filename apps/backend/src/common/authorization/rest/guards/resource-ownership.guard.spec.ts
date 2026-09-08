import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DomainValidationException } from '../../../exceptions/domain.exceptions';
import { VerifyResourceAccessUseCase } from '../../application/use-cases/verify-resource-access.use-case';
import { OwnsResourceRule } from '../decorators/owns-resource.decorator';
import { ResourceOwnershipGuard } from './resource-ownership.guard';

interface FakeRequest {
  user?: { id: string };
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
}

function contextFor(request: FakeRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('ResourceOwnershipGuard', () => {
  let guard: ResourceOwnershipGuard;
  let reflector: Reflector;
  let execute: jest.Mock;

  function givenRules(...rules: OwnsResourceRule[]) {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(rules);
  }

  beforeEach(() => {
    reflector = new Reflector();
    execute = jest.fn().mockResolvedValue(undefined);
    guard = new ResourceOwnershipGuard(reflector, {
      execute,
    } as unknown as VerifyResourceAccessUseCase);
  });

  it('allows routes that declare no rules', async () => {
    givenRules();

    await expect(guard.canActivate(contextFor({}))).resolves.toBe(true);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated request', async () => {
    givenRules({ resource: 'expenseItem' });

    await expect(
      guard.canActivate(contextFor({ params: { id: 'item-1' } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('verifies the route parameter by default', async () => {
    givenRules({ resource: 'expenseItem' });

    await guard.canActivate(
      contextFor({ user: { id: 'user-a' }, params: { id: 'item-1' } }),
    );

    expect(execute).toHaveBeenCalledWith('expenseItem', 'item-1', 'user-a');
  });

  it('verifies a query parameter', async () => {
    givenRules({ resource: 'expense', source: 'query', key: 'expenseId' });

    await guard.canActivate(
      contextFor({ user: { id: 'user-a' }, query: { expenseId: 'expense-1' } }),
    );

    expect(execute).toHaveBeenCalledWith('expense', 'expense-1', 'user-a');
  });

  it('verifies a body field', async () => {
    givenRules({ resource: 'expense', source: 'body', key: 'expenseId' });

    await guard.canActivate(
      contextFor({ user: { id: 'user-a' }, body: { expenseId: 'expense-1' } }),
    );

    expect(execute).toHaveBeenCalledWith('expense', 'expense-1', 'user-a');
  });

  it('skips an optional rule when the id is absent', async () => {
    givenRules({
      resource: 'expense',
      source: 'query',
      key: 'expenseId',
      optional: true,
    });

    await expect(
      guard.canActivate(contextFor({ user: { id: 'user-a' }, query: {} })),
    ).resolves.toBe(true);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects a required rule when the id is absent', async () => {
    givenRules({ resource: 'expense', source: 'body', key: 'expenseId' });

    await expect(
      guard.canActivate(contextFor({ user: { id: 'user-a' }, body: {} })),
    ).rejects.toBeInstanceOf(DomainValidationException);
  });

  it('propagates the verification failure', async () => {
    givenRules({ resource: 'expenseItem' });
    const denied = new Error('Expense item not found');
    execute.mockRejectedValue(denied);

    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'user-b' }, params: { id: 'item-1' } }),
      ),
    ).rejects.toBe(denied);
  });
});
