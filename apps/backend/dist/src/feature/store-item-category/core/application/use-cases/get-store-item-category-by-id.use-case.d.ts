import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
export declare class GetStoreItemCategoryByIdUseCase {
    private readonly storeItemCategoryRepository;
    constructor(storeItemCategoryRepository: IStoreItemCategoryRepository);
    execute(id: string): Promise<StoreItemCategory>;
}
