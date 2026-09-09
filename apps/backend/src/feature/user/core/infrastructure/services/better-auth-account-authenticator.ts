import { Injectable } from '@nestjs/common';
import { BetterAuthProvider } from '~feature/auth/core/infrastructure/providers/better-auth.provider';
import { IAccountAuthenticator } from '../../domain/services/account-authenticator.interface';

const CREDENTIAL_PROVIDER_ID = 'credential';

@Injectable()
export class BetterAuthAccountAuthenticator implements IAccountAuthenticator {
  private readonly betterAuth: BetterAuthProvider['auth'];

  constructor(betterAuthProvider: BetterAuthProvider) {
    this.betterAuth = betterAuthProvider.auth;
  }

  async hasPassword(userId: string): Promise<boolean> {
    return (await this.passwordHashOf(userId)) !== null;
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const hash = await this.passwordHashOf(userId);

    if (!hash) {
      return false;
    }

    const context = await this.betterAuth.$context;

    return context.password.verify({ password, hash });
  }

  private async passwordHashOf(userId: string): Promise<string | null> {
    const context = await this.betterAuth.$context;
    const accounts = await context.internalAdapter.findAccounts(userId);

    const credential = accounts.find(
      (account) =>
        account.providerId === CREDENTIAL_PROVIDER_ID && account.password,
    );

    return credential?.password ?? null;
  }
}
