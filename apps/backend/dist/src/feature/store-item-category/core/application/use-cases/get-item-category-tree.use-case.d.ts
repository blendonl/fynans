import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
export interface ItemCategoryTree {
    category: StoreItemCategory;
    children: ItemCategoryTree[];
}
export declare class GetItemCategoryTreeUseCase {
    private readonly storeItemCategoryRepository;
    constructor(storeItemCategoryRepository: IStoreItemCategoryRepository);
    execute(): Promise<ItemCategoryTree[]>;
    private buildTree;
}
