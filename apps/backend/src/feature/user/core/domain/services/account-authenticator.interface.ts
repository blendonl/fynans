export const ACCOUNT_AUTHENTICATOR = 'AccountAuthenticator';

export interface IAccountAuthenticator {
  hasPassword(userId: string): Promise<boolean>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
}
