import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IStoredReceiptRepository } from '../../domain/repositories/stored-receipt.repository.interface';
import { StoredReceipt } from '../../domain/entities/stored-receipt.entity';

@Injectable()
export class LinkReceiptToExpenseUseCase {
  constructor(
    @Inject('StoredReceiptRepository')
    private readonly receiptRepo: IStoredReceiptRepository,
  ) {}

  async execute(
    receiptId: string,
    expenseId: string,
    userId: string,
  ): Promise<StoredReceipt> {
    const receipt = await this.receiptRepo.findById(receiptId);
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    const isOwner = await this.receiptRepo.verifyOwnership(receiptId, userId);
    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this receipt');
    }

    return this.receiptRepo.update(receiptId, { expenseId });
  }
}
