import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';
import { StoredReceipt } from '../entities/stored-receipt.entity';

export interface StoredReceiptFilters {
  userId?: string;
  familyId?: string;
  expenseId?: string;
}

export interface IStoredReceiptRepository {
  create(data: {
    id: string;
    userId: string;
    familyId?: string;
    expenseId?: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
  }): Promise<StoredReceipt>;

  findById(id: string): Promise<StoredReceipt | null>;

  findAll(
    filters?: StoredReceiptFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoredReceipt>>;

  update(
    id: string,
    data: Partial<{ expenseId: string | null }>,
  ): Promise<StoredReceipt>;

  delete(id: string): Promise<void>;

  verifyOwnership(receiptId: string, userId: string): Promise<boolean>;
}
