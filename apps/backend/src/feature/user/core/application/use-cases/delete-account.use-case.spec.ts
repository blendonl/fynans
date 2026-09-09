import { Logger } from '@nestjs/common';
import {
  DomainForbiddenException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { AccountErasure } from '../../domain/repositories/account-eraser.interface';
import { User } from '../../domain/entities/user.entity';
import { DeleteAccountUseCase } from './delete-account.use-case';

const EMAIL = 'owner@example.com';

function userDouble(): User {
  return new User({
    id: 'user-1',
    email: EMAIL,
    firstName: 'Ada',
    lastName: 'Lovelace',
    image: null,
    emailVerified: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

function erasureDouble(
  overrides: Partial<AccountErasure> = {},
): AccountErasure {
  return {
    transactions: 0,
    receipts: 0,
    auditEntries: 0,
    storageKeys: [],
    families: [],
    ...overrides,
  };
}

function build(
  options: {
    hasPassword?: boolean;
    passwordValid?: boolean;
    erasure?: AccountErasure;
    storageDelete?: jest.Mock;
  } = {},
) {
  const erase = jest.fn().mockResolvedValue(options.erasure ?? erasureDouble());
  const revokeAll = jest.fn().mockResolvedValue({ clearedCookies: [] });
  const hasPassword = jest.fn().mockResolvedValue(options.hasPassword ?? true);
  const verifyPassword = jest
    .fn()
    .mockResolvedValue(options.passwordValid ?? true);
  const storageDelete =
    options.storageDelete ?? jest.fn().mockResolvedValue(undefined);
  const recalculateBalances = jest.fn().mockResolvedValue(undefined);

  const useCase = new DeleteAccountUseCase(
    { erase },
    { hasPassword, verifyPassword },
    { revokeAll },
    { delete: storageDelete } as never,
    { recalculateBalances } as never,
  );

  return {
    useCase,
    erase,
    revokeAll,
    hasPassword,
    verifyPassword,
    storageDelete,
    recalculateBalances,
  };
}

function input(overrides: Record<string, unknown> = {}) {
  return {
    user: userDouble(),
    confirmEmail: EMAIL,
    currentPassword: 'correct horse',
    sessionHeaders: new Headers({ cookie: 'better-auth.session_token=abc' }),
    sessionCacheKey: 'cookie=abc|bearer=',
    ...overrides,
  };
}

describe('DeleteAccountUseCase', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('re-authentication', () => {
    it('refuses when the typed email does not match the account', async () => {
      const { useCase, erase } = build();

      await expect(
        useCase.execute(input({ confirmEmail: 'someone@else.com' })),
      ).rejects.toBeInstanceOf(DomainValidationException);
      expect(erase).not.toHaveBeenCalled();
    });

    it('accepts the typed email regardless of case and surrounding space', async () => {
      const { useCase, erase } = build();

      await useCase.execute(
        input({ confirmEmail: `  ${EMAIL.toUpperCase()} ` }),
      );

      expect(erase).toHaveBeenCalledWith('user-1');
    });

    it('refuses a password account with no password supplied', async () => {
      const { useCase, erase } = build();

      await expect(
        useCase.execute(input({ currentPassword: undefined })),
      ).rejects.toBeInstanceOf(DomainValidationException);
      expect(erase).not.toHaveBeenCalled();
    });

    it('refuses a password account when the password is wrong', async () => {
      const { useCase, erase } = build({ passwordValid: false });

      await expect(useCase.execute(input())).rejects.toBeInstanceOf(
        DomainForbiddenException,
      );
      expect(erase).not.toHaveBeenCalled();
    });

    it('lets an account with no password confirm with the email alone', async () => {
      const { useCase, erase, verifyPassword } = build({ hasPassword: false });

      await useCase.execute(input({ currentPassword: undefined }));

      expect(verifyPassword).not.toHaveBeenCalled();
      expect(erase).toHaveBeenCalledWith('user-1');
    });
  });

  it('revokes every session before it erases anything', async () => {
    const order: string[] = [];
    const { useCase, revokeAll, erase } = build();

    revokeAll.mockImplementation(() => {
      order.push('revoke');
      return Promise.resolve({ clearedCookies: [] });
    });
    erase.mockImplementation(() => {
      order.push('erase');
      return Promise.resolve(erasureDouble());
    });

    await useCase.execute(input());

    expect(order).toEqual(['revoke', 'erase']);
    expect(revokeAll).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        currentCacheKey: 'cookie=abc|bearer=',
      }),
    );
  });

  it('hands back the cookies that sign the browser out of the deleted account', async () => {
    const { useCase, revokeAll } = build();

    revokeAll.mockResolvedValue({
      clearedCookies: ['better-auth.session_token=; Max-Age=0; Path=/'],
    });

    const result = await useCase.execute(input());

    expect(result.clearedCookies).toEqual([
      'better-auth.session_token=; Max-Age=0; Path=/',
    ]);
  });

  it('removes every receipt object the erasure reported', async () => {
    const { useCase, storageDelete } = build({
      erasure: erasureDouble({
        storageKeys: ['receipts/a.jpg', 'receipts/b.jpg'],
      }),
    });

    await useCase.execute(input());

    expect(storageDelete.mock.calls.flat()).toEqual([
      'receipts/a.jpg',
      'receipts/b.jpg',
    ]);
  });

  it('retries a failing object delete and reports the ones it could not remove', async () => {
    const storageDelete = jest
      .fn()
      .mockRejectedValueOnce(new Error('connection reset'))
      .mockResolvedValueOnce(undefined)
      .mockRejectedValue(new Error('bucket unreachable'));
    const error = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    const { useCase } = build({
      storageDelete,
      erasure: erasureDouble({ storageKeys: ['keeps/a.jpg', 'stuck/b.jpg'] }),
    });

    await useCase.execute(input());

    expect(storageDelete).toHaveBeenCalledTimes(4);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('stuck/b.jpg'));
  });

  it('reconciles the balances of families that survived the deletion', async () => {
    const { useCase, recalculateBalances } = build({
      erasure: erasureDouble({
        families: [
          {
            familyId: 'family-kept',
            outcome: 'ownership-transferred',
            newOwnerId: 'user-2',
          },
          { familyId: 'family-gone', outcome: 'family-removed' },
          { familyId: 'family-same', outcome: 'unchanged' },
        ],
      }),
    });

    await useCase.execute(input());

    expect(recalculateBalances.mock.calls.flat()).toEqual([
      'family-kept',
      'family-same',
    ]);
  });
});
