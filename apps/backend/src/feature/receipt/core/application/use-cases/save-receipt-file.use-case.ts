import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IStoredReceiptRepository } from '../../domain/repositories/stored-receipt.repository.interface';
import { IStorageProvider } from '~common/storage/storage-provider.interface';
import { StoredReceipt } from '../../domain/entities/stored-receipt.entity';

interface SaveReceiptFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  userId: string;
  familyId?: string;
}

@Injectable()
export class SaveReceiptFileUseCase {
  private readonly logger = new Logger(SaveReceiptFileUseCase.name);

  constructor(
    @Inject('StoredReceiptRepository')
    private readonly receiptRepo: IStoredReceiptRepository,
    @Inject('StorageProvider')
    private readonly storage: IStorageProvider,
  ) {}

  async execute(input: SaveReceiptFileInput): Promise<StoredReceipt> {
    const id = randomUUID();
    const ext = this.getExtension(input.originalName, input.mimeType);
    const fileName = `${id}.${ext}`;
    const storageKey = `receipts/${input.userId}/${fileName}`;

    await this.storage.upload(storageKey, input.buffer, input.mimeType);

    this.logger.log(
      `Uploaded receipt ${id} to ${storageKey} (${input.buffer.length} bytes)`,
    );

    return this.receiptRepo.create({
      id,
      userId: input.userId,
      familyId: input.familyId,
      fileName,
      originalName: input.originalName,
      mimeType: input.mimeType,
      fileSize: input.buffer.length,
      storageKey,
    });
  }

  private getExtension(originalName: string, mimeType: string): string {
    const fromName = originalName.split('.').pop()?.toLowerCase();
    if (fromName && ['jpg', 'jpeg', 'png'].includes(fromName)) {
      return fromName;
    }

    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
    };
    return mimeMap[mimeType] ?? 'jpg';
  }
}
