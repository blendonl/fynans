export const SESSION_REVOKER = 'SessionRevoker';

export interface RevokeSessionsCommand {
  userId: string;
  sessionHeaders: Headers;
  currentCacheKey: string | null;
}

export interface RevokeSessionsResult {
  clearedCookies: string[];
}

export interface ISessionRevoker {
  revokeAll(command: RevokeSessionsCommand): Promise<RevokeSessionsResult>;
}
