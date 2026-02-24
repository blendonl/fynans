import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoredReceipt } from '../../core/domain/entities/stored-receipt.entity';

export class StoredReceiptResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  familyId?: string | null;

  @ApiPropertyOptional()
  expenseId?: string | null;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  downloadUrl?: string;

  static fromEntity(
    receipt: StoredReceipt,
    downloadUrl?: string,
  ): StoredReceiptResponseDto {
    const dto = new StoredReceiptResponseDto();
    dto.id = receipt.id;
    dto.userId = receipt.userId;
    dto.familyId = receipt.familyId;
    dto.expenseId = receipt.expenseId;
    dto.fileName = receipt.fileName;
    dto.originalName = receipt.originalName;
    dto.mimeType = receipt.mimeType;
    dto.fileSize = receipt.fileSize;
    dto.createdAt = receipt.createdAt;
    dto.updatedAt = receipt.updatedAt;
    dto.downloadUrl = downloadUrl;
    return dto;
  }
}
