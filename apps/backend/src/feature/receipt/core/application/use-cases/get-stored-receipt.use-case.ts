import { Inject, Injectable } from '@nestjs/common';
import {
  DomainForbiddenException,
  DomainNotFoundException,
} from '~common/exceptions/domain.exceptions';
import { IStoredReceiptRepository } from '../../domain/repositories/stored-receipt.repository.interface';
import { IStorageProvider } from '~common/storage/storage-provider.interface';
import { StoredReceipt } from '../../domain/entities/stored-receipt.entity';

interface GetStoredReceiptResult {
  receipt: StoredReceipt;
  downloadUrl: string;
}

@Injectable()
export class GetStoredReceiptUseCase {
  constructor(
    @Inject('StoredReceiptRepository')
    private readonly receiptRepo: IStoredReceiptRepository,
    @Inject('StorageProvider')
    private readonly storage: IStorageProvider,
  ) {}

  async execute(
    receiptId: string,
    userId: string,
  ): Promise<GetStoredReceiptResult> {
    const receipt = await this.receiptRepo.findById(receiptId);
    if (!receipt) {
      throw new DomainNotFoundException('Receipt not found');
    }

    const isOwner = await this.receiptRepo.verifyOwnership(receiptId, userId);
    if (!isOwner) {
      throw new DomainForbiddenException(
        'You do not have access to this receipt',
      );
    }

    const downloadUrl = await this.storage.getPresignedDownloadUrl(
      receipt.storageKey,
      3600,
    );

    return { receipt, downloadUrl };
  }
}
