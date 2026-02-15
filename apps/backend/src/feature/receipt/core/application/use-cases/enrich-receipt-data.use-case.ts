import { Injectable, Inject, Logger } from '@nestjs/common';
import { ProcessedReceiptData } from '../interfaces/processed-receipt-data.interface';
import { FindStoreBySimilarityUseCase } from '~feature/store/core/application/use-cases/find-store-by-similarity.use-case';
import { type IStoreItemRepository } from '~feature/store/core/domain/repositories/store-item.repository.interface';
import { type IExpenseCategoryRepository } from '~feature/expense-category/core/domain/repositories/expense-category.repository.interface';
import { EnrichedReceiptDataDto } from '../dto/enriched-receipt-data.dto';
import { AutoCreateCategoriesUseCase } from './auto-create-categories.use-case';
import { Pagination } from '~feature/transaction/core/application/dto/pagination.dto';

@Injectable()
export class EnrichReceiptDataUseCase {
  private readonly logger = new Logger(EnrichReceiptDataUseCase.name);

  constructor(
    private readonly findStoreBySimilarityUseCase: FindStoreBySimilarityUseCase,
    @Inject('StoreItemRepository')
    private readonly storeItemRepository: IStoreItemRepository,
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
    private readonly autoCreateCategoriesUseCase: AutoCreateCategoriesUseCase,
  ) {}

  async execute(
    processedData: ProcessedReceiptData,
    userId?: string,
  ): Promise<EnrichedReceiptDataDto> {
    const store = await this.findStoreBySimilarityUseCase.execute(
      processedData.storeName,
    );

    // Auto-create item categories from AI suggestions
    let categoryMap = new Map<string, string>();
    if (userId) {
      const suggestedCategories = processedData.items
        .map((item) => item.suggestedItemCategory)
        .filter((name): name is string => !!name);

      if (suggestedCategories.length > 0) {
        try {
          categoryMap = await this.autoCreateCategoriesUseCase.execute(
            suggestedCategories,
            userId,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to auto-create categories: ${error instanceof Error ? error.message : error}`,
          );
        }
      }
    }

    // Resolve suggested expense category
    let suggestedExpenseCategoryId: string | undefined;
    let suggestedExpenseCategoryName: string | undefined;
    if (processedData.suggestedExpenseCategory && userId) {
      try {
        const expenseCategoriesResult =
          await this.expenseCategoryRepository.findAll(userId, new Pagination(1, 100));
        const match = expenseCategoriesResult.data.find(
          (cat) =>
            cat.name.toLowerCase() ===
            processedData.suggestedExpenseCategory!.toLowerCase(),
        );
        if (match) {
          suggestedExpenseCategoryId = match.id;
          suggestedExpenseCategoryName = match.name;
        }
      } catch (error) {
        this.logger.warn(
          `Failed to resolve expense category: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    const enrichedItems = store
      ? await Promise.all(
          processedData.items.map(async (item) => {
            const lookupName = item.matchedExistingItem || item.name;
            const existingItem =
              await this.storeItemRepository.findByStoreAndName(
                store.id,
                lookupName,
              );

            return {
              id: existingItem?.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              categoryId: existingItem?.item?.categoryId,
              suggestedItemCategoryId:
                item.suggestedItemCategory
                  ? categoryMap.get(item.suggestedItemCategory)
                  : undefined,
            };
          }),
        )
      : processedData.items.map((item) => ({
          id: undefined,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          categoryId: undefined,
          suggestedItemCategoryId:
            item.suggestedItemCategory
              ? categoryMap.get(item.suggestedItemCategory)
              : undefined,
        }));

    return {
      store: {
        id: store?.id,
        name: store?.name || processedData.storeName,
        location: store?.location || processedData.storeLocation,
      },
      items: enrichedItems,
      recordedAt: processedData.recordedAt,
      extractedText: processedData.extractedText,
      confidence: processedData.confidence,
      parserUsed: processedData.parserUsed,
      suggestedExpenseCategoryId,
      suggestedExpenseCategoryName,
    };
  }
}
