import { Inject, Injectable, Logger } from '@nestjs/common';
import { IStorageProvider } from '~common/storage/storage-provider.interface';
import { Expense } from '../../domain/entities/expense.entity';

@Injectable()
export class ExpenseReceiptUrlResolver {
  private readonly logger = new Logger(ExpenseReceiptUrlResolver.name);

  constructor(
    @Inject('StorageProvider') private readonly storage: IStorageProvider,
  ) {}

  async resolve(expense: Expense): Promise<string[]> {
    const receipt = expense.receipt;
    if (!receipt) {
      return [];
    }

    try {
      return [await this.storage.getPresignedDownloadUrl(receipt.storageKey)];
    } catch {
      this.logger.warn(
        `Could not presign the receipt of expense ${expense.id}; returning no image`,
      );
      return [];
    }
  }

  async resolveAll(expenses: Expense[]): Promise<string[][]> {
    return Promise.all(expenses.map((expense) => this.resolve(expense)));
  }
}
