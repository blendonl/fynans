export type OwnedResource =
  | 'expense'
  | 'expenseItem'
  | 'income'
  | 'transaction';

export const OWNED_RESOURCE_LABELS: Record<OwnedResource, string> = {
  expense: 'Expense',
  expenseItem: 'Expense item',
  income: 'Income',
  transaction: 'Transaction',
};

export interface ResourceOwner {
  userId: string;
  familyId: string | null;
}
