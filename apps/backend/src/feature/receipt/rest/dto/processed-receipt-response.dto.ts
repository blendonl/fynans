import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrichedReceiptDataDto } from '../../core/application/dto/enriched-receipt-data.dto';

class ItemSizeDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  unit: string;
}

class SuggestedExpenseCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class ProcessedStoreDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location: string;
}

export class ProcessedItemDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  suggestedItemCategoryId?: string;

  @ApiPropertyOptional()
  suggestedItemCategoryName?: string;

  @ApiPropertyOptional()
  resolvedCategoryId?: string;

  @ApiPropertyOptional({ type: () => ItemSizeDto })
  size?: ItemSizeDto;
}

export class ProcessedReceiptResponseDto {
  @ApiProperty({ type: () => ProcessedStoreDto, nullable: true })
  store: ProcessedStoreDto | null;

  @ApiProperty({ type: () => [ProcessedItemDto] })
  items: ProcessedItemDto[];

  @ApiPropertyOptional()
  recordedAt?: string;

  @ApiProperty()
  extractedText: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  isLowConfidence: boolean;

  @ApiPropertyOptional()
  parserUsed?: string;

  @ApiPropertyOptional({ type: () => SuggestedExpenseCategoryDto })
  suggestedExpenseCategory?: SuggestedExpenseCategoryDto;

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
