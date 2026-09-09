export const TRANSACTION_DETAIL_REPOSITORY = 'TransactionDetailRepository';

export interface TransactionDetail {
  description: string | null;
  categoryName: string | null;
  storeName: string | null;
  paymentMethodName: string | null;
}

export interface ITransactionDetailRepository {
  findByTransactionIds(ids: string[]): Promise<Map<string, TransactionDetail>>;
}
