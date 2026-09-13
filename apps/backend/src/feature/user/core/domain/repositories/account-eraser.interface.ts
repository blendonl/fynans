export const ACCOUNT_ERASER = 'AccountEraser';

export type FamilyHandoverOutcome =
  | 'ownership-transferred'
  | 'family-removed'
  | 'unchanged';

export interface FamilyHandover {
  familyId: string;
  outcome: FamilyHandoverOutcome;
  newOwnerId?: string;
}

export interface AccountErasure {
  transactions: number;
  receipts: number;
  auditEntries: number;
  storageKeys: string[];
  families: FamilyHandover[];
}

export interface IAccountEraser {
  erase(userId: string): Promise<AccountErasure>;
}
