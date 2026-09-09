import { Injectable, Logger } from '@nestjs/common';
import { Pagination } from '~common/dto/pagination.dto';
import { ExpenseCategoryService } from '~feature/expense-category/core/application/services/expense-category.service';
import { CreateExpenseCategoryDto } from '~feature/expense-category/core/application/dto/create-expense-category.dto';
import { IncomeCategoryService } from '~feature/income-category/core/application/services/income-category.service';
import { CreateIncomeCategoryDto } from '~feature/income-category/core/application/dto/create-income-category.dto';
import { StoreItemCategoryService } from '~feature/store-item-category/core/application/services/store-item-category.service';
import { CreateStoreItemCategoryDto } from '~feature/store-item-category/core/application/dto/create-store-item-category.dto';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_ITEM_CATEGORIES,
  SeedCategoryNode,
} from '../../domain/default-catalog';

export interface CatalogSeedResult {
  expenseCategoriesCreated: number;
  incomeCategoriesCreated: number;
  itemCategoriesCreated: number;
}

const FIRST_ROW_ONLY = new Pagination(1, 1);

function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

@Injectable()
export class SeedUserCatalogUseCase {
  private readonly logger = new Logger(SeedUserCatalogUseCase.name);

  constructor(
    private readonly expenseCategoryService: ExpenseCategoryService,
    private readonly incomeCategoryService: IncomeCategoryService,
    private readonly storeItemCategoryService: StoreItemCategoryService,
  ) {}

  async execute(userId: string): Promise<CatalogSeedResult> {
    const [
      expenseCategoriesCreated,
      incomeCategoriesCreated,
      itemCategoriesCreated,
    ] = await Promise.all([
      this.seedExpenseCategories(userId),
      this.seedIncomeCategories(userId),
      this.seedItemCategories(userId),
    ]);

    this.logger.log(
      `Seeded starter catalog for ${userId}: ` +
        `${expenseCategoriesCreated} expense, ` +
        `${incomeCategoriesCreated} income, ` +
        `${itemCategoriesCreated} item categories`,
    );

    return {
      expenseCategoriesCreated,
      incomeCategoriesCreated,
      itemCategoriesCreated,
    };
  }

  private async seedExpenseCategories(userId: string): Promise<number> {
    try {
      const visible = await this.expenseCategoryService.findAll(
        userId,
        undefined,
        FIRST_ROW_ONLY,
      );
      if (visible.total > 0) {
        return 0;
      }

      return await this.createTree(
        DEFAULT_EXPENSE_CATEGORIES,
        null,
        async (node, parentId) => {
          const created = await this.expenseCategoryService.create(
            new CreateExpenseCategoryDto(
              node.name,
              node.requiresStore ?? false,
              parentId,
            ),
            userId,
          );
          return created.id;
        },
      );
    } catch (error) {
      this.logger.error(
        `Could not seed expense categories for ${userId}: ${reasonOf(error)}`,
      );
      return 0;
    }
  }

  private async seedIncomeCategories(userId: string): Promise<number> {
    try {
      const visible = await this.incomeCategoryService.findAll(
        userId,
        undefined,
        FIRST_ROW_ONLY,
      );
      if (visible.total > 0) {
        return 0;
      }

      return await this.createTree(
        DEFAULT_INCOME_CATEGORIES,
        null,
        async (node, parentId) => {
          const created = await this.incomeCategoryService.create(
            new CreateIncomeCategoryDto(node.name, parentId),
            userId,
          );
          return created.id;
        },
      );
    } catch (error) {
      this.logger.error(
        `Could not seed income categories for ${userId}: ${reasonOf(error)}`,
      );
      return 0;
    }
  }

  private async seedItemCategories(userId: string): Promise<number> {
    try {
      const visible = await this.storeItemCategoryService.findAll(
        userId,
        undefined,
        FIRST_ROW_ONLY,
      );
      if (visible.total > 0) {
        return 0;
      }

      let created = 0;
      for (const name of DEFAULT_ITEM_CATEGORIES) {
        await this.storeItemCategoryService.create(
          new CreateStoreItemCategoryDto(name),
          userId,
        );
        created += 1;
      }
      return created;
    } catch (error) {
      this.logger.error(
        `Could not seed item categories for ${userId}: ${reasonOf(error)}`,
      );
      return 0;
    }
  }

  private async createTree(
    nodes: SeedCategoryNode[],
    parentId: string | null,
    create: (
      node: SeedCategoryNode,
      parentId: string | null,
    ) => Promise<string>,
  ): Promise<number> {
    let created = 0;

    for (const node of nodes) {
      const id = await create(node, parentId);
      created += 1;
      created += await this.createTree(node.children ?? [], id, create);
    }

    return created;
  }
}
