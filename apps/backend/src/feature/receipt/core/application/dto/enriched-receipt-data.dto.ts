export class EnrichedReceiptStoreDto {
  id?: string;
  name: string;
  location: string;
}

export class EnrichedReceiptItemDto {
  id?: string;
  name: string;
  nameEn?: string;
  price: number;
  quantity: number;
  categoryId?: string;
  suggestedItemCategoryId?: string;
  suggestedItemCategory?: string;
  suggestedItemCategoryName?: string;
  resolvedCategoryId?: string;
  size?: { value: number; unit: string };
  itemId?: string;
}

export class EnrichedReceiptDataDto {
  store: EnrichedReceiptStoreDto;
  items: EnrichedReceiptItemDto[];
  recordedAt?: Date;
  extractedText: string;
  confidence: number;
  isLowConfidence: boolean;
  parserUsed?: string;
  suggestedExpenseCategoryId?: string;
  suggestedExpenseCategoryName?: string;
}
