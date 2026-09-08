export type OwnedResource = 'expense' | 'expenseItem';

export const OWNED_RESOURCE_LABELS: Record<OwnedResource, string> = {
  expense: 'Expense',
  expenseItem: 'Expense item',
};

export interface ResourceOwner {
  userId: string;
  familyId: string | null;
}
