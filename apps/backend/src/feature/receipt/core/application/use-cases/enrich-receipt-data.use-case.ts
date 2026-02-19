import { Injectable, Inject, Logger } from '@nestjs/common';
/** Must match RECEIPT_LOW_CONFIDENCE_THRESHOLD in @fynans/shared */
const LOW_CONFIDENCE_THRESHOLD = 50;
import { ProcessedReceiptData } from '../interfaces/processed-receipt-data.interface';
import { FindStoreBySimilarityUseCase } from '~feature/store/core/application/use-cases/find-store-by-similarity.use-case';
import { CreateOrFindStoreUseCase } from '~feature/store/core/application/use-cases/create-or-find-store.use-case';
import { type IStoreItemRepository } from '~feature/store/core/domain/repositories/store-item.repository.interface';
import { type IExpenseCategoryRepository } from '~feature/expense-category/core/domain/repositories/expense-category.repository.interface';
import { type IItemRepository } from '~feature/item/core/domain/repositories/item.repository.interface';
import { type IItemSizeRepository } from '~feature/item/core/domain/repositories/item-size.repository.interface';
import { EnrichedReceiptDataDto } from '../dto/enriched-receipt-data.dto';
import { AutoCreateCategoriesUseCase } from './auto-create-categories.use-case';

export interface CategoryResolutionResult {
  itemCategoryMap: Map<string, string>;
  suggestedExpenseCategoryId?: string;
  suggestedExpenseCategoryName?: string;
}

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
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
    @Inject('ItemSizeRepository')
    private readonly itemSizeRepository: IItemSizeRepository,
    private readonly autoCreateCategoriesUseCase: AutoCreateCategoriesUseCase,
  ) {}

  /**
   * Phase 1 (fast): Resolve store, find/create items and sizes, match store items.
   * Returns partial result suitable for immediate UI display.
   */
  async resolveStoreAndItems(
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

    const enrichedItems = await Promise.all(
      processedData.items.map(async (item) => {
        let itemId: string | undefined;
        let itemSizeId: string | undefined;
        let existingStoreItemId: string | undefined;
        let categoryId: string | undefined;
        let resolvedName = item.name;
        let resolvedNameEn = item.nameEn;

        // Try to find existing Item record: exact match first, then fuzzy
        try {
          let dbItem = await this.itemRepository.findByName(item.name);

          if (!dbItem) {
            dbItem = await this.itemRepository.findBySimilarName(item.name);
            if (dbItem) {
              this.logger.log(
                `Fuzzy matched "${item.name}" → "${dbItem.name}" (id=${dbItem.id})`,
              );
              // Keep parser's clean name (size already stripped by post-processor)
              // Only use DB match for IDs; update nameEn from DB if parser doesn't have one
              if (!resolvedNameEn && dbItem.nameEn) resolvedNameEn = dbItem.nameEn;
            }
          }

          if (dbItem) {
            itemId = dbItem.id;
            categoryId = dbItem.categoryId;

            // Update nameEn if missing
            if (item.nameEn && !dbItem.nameEn) {
              await this.itemRepository.update(dbItem.id, { nameEn: item.nameEn } as any);
            }

            // Find or create ItemSize if size info exists
            if (item.size) {
              const itemSize = await this.itemSizeRepository.create({
                itemId: dbItem.id,
                value: item.size.value,
                unit: item.size.unit,
              });
              itemSizeId = itemSize.id;
            }

            // Find existing StoreItem by store + item + size
            if (store) {
              const existingStoreItem = await this.storeItemRepository.findByStoreItemAndSize(
                store.id,
                dbItem.id,
                itemSizeId,
              );
              existingStoreItemId = existingStoreItem?.id;
            }
          }
        } catch (error) {
          this.logger.warn(
            `Failed to resolve item "${item.name}": ${error instanceof Error ? error.message : error}`,
          );
        }

        return {
          id: existingStoreItemId,
          name: resolvedName,
          nameEn: resolvedNameEn,
          price: item.price,
          quantity: item.quantity,
          categoryId,
          suggestedItemCategory: item.suggestedItemCategory,
          suggestedItemCategoryName: item.suggestedItemCategory,
          size: item.size,
          itemId,
          itemSizeId,
        };
      }),
    );

    const result = {
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
    };

    const matched = enrichedItems.filter((i) => i.itemId).length;
    const withSize = enrichedItems.filter((i) => i.itemSizeId).length;
    const withStoreItem = enrichedItems.filter((i) => i.id).length;
    this.logger.log(
      `resolveStoreAndItems: store="${result.store.name}" (id=${result.store.id ?? 'new'}), ` +
      `${enrichedItems.length} items (${matched} matched, ${withSize} with size, ${withStoreItem} with storeItem)`,
    );
    this.logger.debug(
      `resolveStoreAndItems items: ${JSON.stringify(enrichedItems.map((i) => ({ name: i.name, nameEn: i.nameEn, size: i.size, itemId: i.itemId, itemSizeId: i.itemSizeId, storeItemId: i.id })))}`,
    );

    return result;
  }

  /**
   * Phase 2 (background): Resolve item categories and expense categories.
   */
  async resolveCategories(
    processedData: ProcessedReceiptData,
    userId?: string,
  ): Promise<CategoryResolutionResult> {
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

    const categoriesResolved = Array.from(categoryMap.entries())
      .map(([name, id]) => `${name}=${id}`)
      .join(', ');
    this.logger.log(
      `resolveCategories: ${categoryMap.size} item categories [${categoriesResolved}], ` +
      `expenseCategory="${suggestedExpenseCategoryName ?? 'none'}" (id=${suggestedExpenseCategoryId ?? 'none'})`,
    );

    return {
      itemCategoryMap: categoryMap,
      suggestedExpenseCategoryId,
      suggestedExpenseCategoryName,
    };
  }

  /**
   * Legacy method: runs both phases and merges results.
   */
  async execute(
    processedData: ProcessedReceiptData,
    userId?: string,
  ): Promise<EnrichedReceiptDataDto> {
    const partial = await this.resolveStoreAndItems(processedData, userId);
    const categories = await this.resolveCategories(processedData, userId);

    return {
      ...partial,
      items: partial.items.map((item) => ({
        ...item,
        suggestedItemCategoryId: item.suggestedItemCategory
          ? categories.itemCategoryMap.get(item.suggestedItemCategory)
          : undefined,
        resolvedCategoryId:
          (item.suggestedItemCategory
            ? categories.itemCategoryMap.get(item.suggestedItemCategory)
            : undefined) ||
          item.categoryId ||
          categories.suggestedExpenseCategoryId ||
          undefined,
      })),
      suggestedExpenseCategoryId: categories.suggestedExpenseCategoryId,
      suggestedExpenseCategoryName: categories.suggestedExpenseCategoryName,
    };
  }
}
