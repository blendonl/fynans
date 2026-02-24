import { Receipt as PrismaReceipt } from 'prisma/generated/prisma/client';
import { StoredReceipt } from '../../domain/entities/stored-receipt.entity';

export class StoredReceiptMapper {
  static toDomain(prismaReceipt: PrismaReceipt): StoredReceipt {
    return new StoredReceipt({
      id: prismaReceipt.id,
      userId: prismaReceipt.userId,
      familyId: prismaReceipt.familyId,
      expenseId: prismaReceipt.expenseId,
      fileName: prismaReceipt.fileName,
      originalName: prismaReceipt.originalName,
      mimeType: prismaReceipt.mimeType,
      fileSize: prismaReceipt.fileSize,
      storageKey: prismaReceipt.storageKey,
      createdAt: prismaReceipt.createdAt,
      updatedAt: prismaReceipt.updatedAt,
    });
  }
}
