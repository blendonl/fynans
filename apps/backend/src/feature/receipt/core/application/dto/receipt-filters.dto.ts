import { StoredReceiptFilters } from '../../domain/repositories/stored-receipt.repository.interface';

export class ReceiptFilters implements StoredReceiptFilters {
  userId?: string;
  familyId?: string;
  expenseId?: string;

  constructor(data: StoredReceiptFilters) {
    this.userId = data.userId;
    this.familyId = data.familyId;
    this.expenseId = data.expenseId;
  }

  static fromQuery(
    query: {
      familyId?: string;
      expenseId?: string;
    },
    userId: string,
  ): StoredReceiptFilters {
    return {
      userId: query.familyId ? undefined : userId,
      familyId: query.familyId,
      expenseId: query.expenseId,
    };
  }
}
