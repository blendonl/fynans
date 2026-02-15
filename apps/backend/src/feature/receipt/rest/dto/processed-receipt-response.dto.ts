import { EnrichedReceiptDataDto } from '../../core/application/dto/enriched-receipt-data.dto';

class ProcessedStoreDto {
  id?: string;
  name: string;
  location: string;
}

class ProcessedItemDto {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  categoryId?: string;
  suggestedItemCategoryId?: string;
}

export class ProcessedReceiptResponseDto {
  store: ProcessedStoreDto | null;
  items: ProcessedItemDto[];
  recordedAt?: string;
  extractedText: string;
  confidence: number;
  parserUsed?: string;
  suggestedExpenseCategory?: { id: string; name: string };

  static fromData(data: EnrichedReceiptDataDto): ProcessedReceiptResponseDto {
    const dto = new ProcessedReceiptResponseDto();
    dto.store = data.store;
    dto.items = data.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      categoryId: item.categoryId,
      suggestedItemCategoryId: item.suggestedItemCategoryId,
    }));
    dto.recordedAt = data.recordedAt?.toISOString();
    dto.extractedText = data.extractedText;
    dto.confidence = data.confidence;
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
