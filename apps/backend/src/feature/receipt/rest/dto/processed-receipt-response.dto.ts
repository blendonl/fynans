import { EnrichedReceiptDataDto } from '../../core/application/dto/enriched-receipt-data.dto';

class ProcessedStoreDto {
  id?: string;
  name: string;
  location: string;
}

class ProcessedItemDto {
  id?: string;
  name: string;
  nameEn?: string;
  price: number;
  quantity: number;
  categoryId?: string;
  suggestedItemCategoryId?: string;
  suggestedItemCategoryName?: string;
  resolvedCategoryId?: string;
  size?: { value: number; unit: string };
}

export class ProcessedReceiptResponseDto {
  store: ProcessedStoreDto | null;
  items: ProcessedItemDto[];
  recordedAt?: string;
  extractedText: string;
  confidence: number;
  isLowConfidence: boolean;
  parserUsed?: string;
  suggestedExpenseCategory?: { id: string; name: string };

  static fromData(data: EnrichedReceiptDataDto): ProcessedReceiptResponseDto {
    const dto = new ProcessedReceiptResponseDto();
    dto.store = data.store;
    dto.items = data.items.map((item) => ({
      id: item.id,
      name: item.name,
      nameEn: item.nameEn,
      price: item.price,
      quantity: item.quantity,
      categoryId: item.categoryId,
      suggestedItemCategoryId: item.suggestedItemCategoryId,
      suggestedItemCategoryName: item.suggestedItemCategoryName,
      resolvedCategoryId: item.resolvedCategoryId,
      size: item.size,
    }));
    dto.recordedAt = data.recordedAt
      ? new Date(data.recordedAt).toISOString()
      : undefined;
    dto.extractedText = data.extractedText;
    dto.confidence = data.confidence;
    dto.isLowConfidence = data.isLowConfidence;
    dto.parserUsed = data.parserUsed;
    if (data.suggestedExpenseCategoryId && data.suggestedExpenseCategoryName) {
      dto.suggestedExpenseCategory = {
        id: data.suggestedExpenseCategoryId,
        name: data.suggestedExpenseCategoryName,
      };
    }
    return dto;
  }
}
