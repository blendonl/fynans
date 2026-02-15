import { Injectable, Logger, Inject } from '@nestjs/common';
import { type IItemRepository } from '~feature/item/core/domain/repositories/item.repository.interface';
import { type IStoreItemCategoryRepository } from '~feature/store-item-category/core/domain/repositories/store-item-category.repository.interface';
import { type IExpenseCategoryRepository } from '~feature/expense-category/core/domain/repositories/expense-category.repository.interface';
import { Pagination } from '~feature/transaction/core/application/dto/pagination.dto';

export interface UserReceiptContext {
  items: Array<{ name: string; categoryName: string }>;
  itemCategories: Array<{ id: string; name: string }>;
  expenseCategories: Array<{ id: string; name: string; isConnectedToStore: boolean }>;
}

@Injectable()
export class FetchUserContextUseCase {
  private readonly logger = new Logger(FetchUserContextUseCase.name);

  constructor(
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
  ) {}

  async execute(userId: string): Promise<UserReceiptContext> {
    const [itemsResult, itemCategoriesResult, expenseCategoriesResult] =
      await Promise.all([
        this.itemRepository.findAll(userId, {}, new Pagination(1, 100)),
        this.storeItemCategoryRepository.findAll(userId, new Pagination(1, 100)),
        this.expenseCategoryRepository.findAll(userId, new Pagination(1, 100)),
      ]);

    const categoryMap = new Map<string, string>();
    for (const cat of itemCategoriesResult.data) {
      categoryMap.set(cat.id, cat.name);
    }

    const items = itemsResult.data.map((item) => ({
      name: item.name,
      categoryName: categoryMap.get(item.categoryId) || 'Uncategorized',
    }));

    const itemCategories = itemCategoriesResult.data.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));

    const expenseCategories = expenseCategoriesResult.data.map((cat) => ({
      id: cat.id,
      name: cat.name,
      isConnectedToStore: cat.isConnectedToStore,
    }));

    this.logger.log(
      `Fetched user context: ${items.length} items, ${itemCategories.length} item categories, ${expenseCategories.length} expense categories`,
    );

    return { items, itemCategories, expenseCategories };
  }
}
