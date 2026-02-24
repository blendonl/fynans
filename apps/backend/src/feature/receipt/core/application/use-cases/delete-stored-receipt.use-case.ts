import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IStoredReceiptRepository } from '../../domain/repositories/stored-receipt.repository.interface';
import { IStorageProvider } from '~common/storage/storage-provider.interface';

@Injectable()
export class DeleteStoredReceiptUseCase {
  private readonly logger = new Logger(DeleteStoredReceiptUseCase.name);

  constructor(
    @Inject('StoredReceiptRepository')
    private readonly receiptRepo: IStoredReceiptRepository,
    @Inject('StorageProvider')
    private readonly storage: IStorageProvider,
  ) {}

  async execute(receiptId: string, userId: string): Promise<void> {
    const receipt = await this.receiptRepo.findById(receiptId);
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    const isOwner = await this.receiptRepo.verifyOwnership(receiptId, userId);
    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this receipt');
    }

    await this.storage.delete(receipt.storageKey);
    this.logger.log(`Deleted file ${receipt.storageKey} from storage`);

    await this.receiptRepo.delete(receiptId);
    this.logger.log(`Deleted receipt record ${receiptId}`);
  }
}
