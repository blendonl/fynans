import { Injectable, Inject, Logger } from '@nestjs/common';
/** Must match RECEIPT_LOW_CONFIDENCE_THRESHOLD in @fynans/shared */
const LOW_CONFIDENCE_THRESHOLD = 50;
import { ProcessedReceiptData } from '../interfaces/processed-receipt-data.interface';
import { FindStoreBySimilarityUseCase } from '~feature/store/core/application/use-cases/find-store-by-similarity.use-case';
import { CreateOrFindStoreUseCase } from '~feature/store/core/application/use-cases/create-or-find-store.use-case';
import { type IStoreItemRepository } from '~feature/store/core/domain/repositories/store-item.repository.interface';
import { type IExpenseCategoryRepository } from '~feature/expense-category/core/domain/repositories/expense-category.repository.interface';
import { EnrichedReceiptDataDto } from '../dto/enriched-receipt-data.dto';
import { AutoCreateCategoriesUseCase } from './auto-create-categories.use-case';

@Injectable()
export class EnrichReceiptDataUseCase {
  private readonly logger = new Logger(EnrichReceiptDataUseCase.name);

  constructor(
    private readonly findStoreBySimilarityUseCase: FindStoreBySimilarityUseCase,
    private readonly createOrFindStoreUseCase: CreateOrFindStoreUseCase,
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
    // Try similarity match first, then create if not found
    let store = await this.findStoreBySimilarityUseCase.execute(
      processedData.storeName,
    );

    if (!store && processedData.storeName && userId) {
      try {
        store = await this.createOrFindStoreUseCase.execute(
          { name: processedData.storeName, location: processedData.storeLocation || '' },
          userId,
        );
        this.logger.log(`Auto-created store: ${store.name}`);
      } catch (error) {
        this.logger.warn(
          `Failed to auto-create store: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

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

    // Resolve or auto-create suggested expense category
    let suggestedExpenseCategoryId: string | undefined;
    let suggestedExpenseCategoryName: string | undefined;
    if (processedData.suggestedExpenseCategory && userId) {
      try {
        let category = await this.expenseCategoryRepository.findByName(
          processedData.suggestedExpenseCategory,
        );

        if (!category) {
          category = await this.expenseCategoryRepository.create({
            name: processedData.suggestedExpenseCategory,
            isConnectedToStore: true,
          });
          await this.expenseCategoryRepository
            .linkToUser(category.id, userId)
            .catch((err) => this.logger.debug('Category already linked', err));
          this.logger.log(
            `Auto-created expense category: ${processedData.suggestedExpenseCategory}`,
          );
        } else if (!category.isConnectedToStore) {
          await this.expenseCategoryRepository.update(category.id, {
            isConnectedToStore: true,
          });
          this.logger.log(
            `Updated expense category to store-connected: ${category.name}`,
          );
        }

        suggestedExpenseCategoryId = category.id;
        suggestedExpenseCategoryName = category.name;
      } catch (error) {
        this.logger.warn(
          `Failed to resolve/create expense category: ${error instanceof Error ? error.message : error}`,
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

            const suggestedItemCategoryId = item.suggestedItemCategory
              ? categoryMap.get(item.suggestedItemCategory)
              : undefined;

            return {
              id: existingItem?.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              categoryId: existingItem?.item?.categoryId,
              suggestedItemCategoryId,
              resolvedCategoryId:
                suggestedItemCategoryId ||
                existingItem?.item?.categoryId ||
                suggestedExpenseCategoryId ||
                undefined,
            };
          }),
        )
      : processedData.items.map((item) => {
          const suggestedItemCategoryId = item.suggestedItemCategory
            ? categoryMap.get(item.suggestedItemCategory)
            : undefined;

          return {
            id: undefined,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            categoryId: undefined,
            suggestedItemCategoryId,
            resolvedCategoryId:
              suggestedItemCategoryId ||
              suggestedExpenseCategoryId ||
              undefined,
          };
        });

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
      isLowConfidence: processedData.confidence < LOW_CONFIDENCE_THRESHOLD,
      parserUsed: processedData.parserUsed,
      suggestedExpenseCategoryId,
      suggestedExpenseCategoryName,
    };
  }
}
