import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository.interface';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';

export interface CategoryTree {
  category: ExpenseCategory;
  children: CategoryTree[];
}

@Injectable()
export class GetCategoryTreeUseCase {
  constructor(
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
  ) {}

  async execute(userId: string): Promise<CategoryTree[]> {
    const rootCategories = await this.expenseCategoryRepository.findByParentId(
      userId,
      null,
    );

    const trees = await Promise.all(
      rootCategories.data.map((category) => this.buildTree(userId, category)),
    );

    return trees;
  }

  private async buildTree(
    userId: string,
    category: ExpenseCategory,
  ): Promise<CategoryTree> {
    const children =
      await this.expenseCategoryRepository.findChildren(category.id);

    const childTrees = await Promise.all(
      children.map((child) => this.buildTree(userId, child)),
    );

    return {
      category,
      children: childTrees,
    };
  }
}
