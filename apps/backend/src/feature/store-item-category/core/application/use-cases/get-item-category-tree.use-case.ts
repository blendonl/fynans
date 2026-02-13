import { Injectable, Inject } from '@nestjs/common';
import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';

export interface ItemCategoryTree {
  category: StoreItemCategory;
  children: ItemCategoryTree[];
}

@Injectable()
export class GetItemCategoryTreeUseCase {
  constructor(
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(userId: string): Promise<ItemCategoryTree[]> {
    const rootCategories = await this.storeItemCategoryRepository.findByParentId(
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
    category: StoreItemCategory,
  ): Promise<ItemCategoryTree> {
    const children =
      await this.storeItemCategoryRepository.findChildren(category.id);

    const childTrees = await Promise.all(
      children.map((child) => this.buildTree(userId, child)),
    );

    return {
      category,
      children: childTrees,
    };
  }
}
