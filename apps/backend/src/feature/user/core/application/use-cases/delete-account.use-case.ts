import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DomainForbiddenException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { type IStorageProvider } from '~common/storage/storage-provider.interface';
import { FamilyBalanceService } from '~feature/family/core/application/services/family-balance.service';
import {
  AccountErasure,
  ACCOUNT_ERASER,
  type IAccountEraser,
} from '../../domain/repositories/account-eraser.interface';
import {
  ACCOUNT_AUTHENTICATOR,
  type IAccountAuthenticator,
} from '../../domain/services/account-authenticator.interface';
import {
  SESSION_REVOKER,
  type ISessionRevoker,
} from '../../domain/services/session-revoker.interface';
import { User } from '../../domain/entities/user.entity';

export interface DeleteAccountInput {
  user: User;
  confirmEmail: string;
  currentPassword?: string;
  sessionHeaders: Headers;
  sessionCacheKey: string | null;
}

export interface DeleteAccountResult {
  erasure: AccountErasure;
  clearedCookies: string[];
}

const STORAGE_DELETE_ATTEMPTS = 2;

@Injectable()
export class DeleteAccountUseCase {
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    @Inject(ACCOUNT_ERASER)
    private readonly accountEraser: IAccountEraser,
    @Inject(ACCOUNT_AUTHENTICATOR)
    private readonly accountAuthenticator: IAccountAuthenticator,
    @Inject(SESSION_REVOKER)
    private readonly sessionRevoker: ISessionRevoker,
    @Inject('StorageProvider')
    private readonly storage: IStorageProvider,
    private readonly familyBalanceService: FamilyBalanceService,
  ) {}

  async execute(input: DeleteAccountInput): Promise<DeleteAccountResult> {
    await this.assertReauthenticated(input);

    const { clearedCookies } = await this.sessionRevoker.revokeAll({
      userId: input.user.id,
      sessionHeaders: input.sessionHeaders,
      currentCacheKey: input.sessionCacheKey,
    });

    const erasure = await this.accountEraser.erase(input.user.id);

    await this.purgeReceiptObjects(input.user.id, erasure.storageKeys);
    await this.reconcileSurvivingFamilies(erasure);

    return { erasure, clearedCookies };
  }

  private async assertReauthenticated(
    input: DeleteAccountInput,
  ): Promise<void> {
    if (
      input.confirmEmail.trim().toLowerCase() !== input.user.email.toLowerCase()
    ) {
      throw new DomainValidationException(
        'Type the email address of this account to confirm deletion',
      );
    }

    if (!(await this.accountAuthenticator.hasPassword(input.user.id))) {
      return;
    }

    if (!input.currentPassword) {
      throw new DomainValidationException(
        'Your current password is required to delete this account',
      );
    }

    const verified = await this.accountAuthenticator.verifyPassword(
      input.user.id,
      input.currentPassword,
    );

    if (!verified) {
      throw new DomainForbiddenException('Current password is incorrect');
    }
  }

  private async purgeReceiptObjects(
    userId: string,
    storageKeys: string[],
  ): Promise<void> {
    const orphaned: string[] = [];

    for (const key of storageKeys) {
      if (!(await this.deleteWithRetry(key))) {
        orphaned.push(key);
      }
    }

    if (orphaned.length > 0) {
      this.logger.error(
        `Deleted account ${userId} but ${orphaned.length} receipt object(s) remain in storage and need a manual sweep: ${orphaned.join(', ')}`,
      );
    }
  }

  private async deleteWithRetry(key: string): Promise<boolean> {
    for (let attempt = 1; attempt <= STORAGE_DELETE_ATTEMPTS; attempt += 1) {
      try {
        await this.storage.delete(key);
        return true;
      } catch (error) {
        this.logger.warn(
          `Receipt object ${key} could not be deleted on attempt ${attempt}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return false;
  }

  private async reconcileSurvivingFamilies(
    erasure: AccountErasure,
  ): Promise<void> {
    const surviving = erasure.families.filter(
      (family) => family.outcome !== 'family-removed',
    );

    for (const family of surviving) {
      try {
        await this.familyBalanceService.recalculateBalances(family.familyId);
      } catch (error) {
        this.logger.error(
          `Family ${family.familyId} balances are stale after an account deletion and need reconciling: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }
}
