import { type IStoreItemCategoryRepository, PaginatedResult } from '../../domain/repositories/store-item-category.repository.interface';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
export declare class ListStoreItemCategoriesUseCase {
    private readonly storeItemCategoryRepository;
    constructor(storeItemCategoryRepository: IStoreItemCategoryRepository);
    execute(parentId?: string | null, pagination?: Pagination): Promise<PaginatedResult<StoreItemCategory>>;
}
