import { CreateStoreItemCategoryUseCase } from '../use-cases/create-store-item-category.use-case';
import { GetStoreItemCategoryByIdUseCase } from '../use-cases/get-store-item-category-by-id.use-case';
import { ListStoreItemCategoriesUseCase } from '../use-cases/list-store-item-categories.use-case';
import { GetItemCategoryTreeUseCase, ItemCategoryTree } from '../use-cases/get-item-category-tree.use-case';
import { UpdateStoreItemCategoryUseCase } from '../use-cases/update-store-item-category.use-case';
import { DeleteStoreItemCategoryUseCase } from '../use-cases/delete-store-item-category.use-case';
import { CreateStoreItemCategoryDto } from '../dto/create-store-item-category.dto';
import { UpdateStoreItemCategoryDto } from '../dto/update-store-item-category.dto';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
import { PaginatedResult } from '../../domain/repositories/store-item-category.repository.interface';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
export declare class StoreItemCategoryService {
    private readonly createStoreItemCategoryUseCase;
    private readonly getStoreItemCategoryByIdUseCase;
    private readonly listStoreItemCategoriesUseCase;
    private readonly getItemCategoryTreeUseCase;
    private readonly updateStoreItemCategoryUseCase;
    private readonly deleteStoreItemCategoryUseCase;
    constructor(createStoreItemCategoryUseCase: CreateStoreItemCategoryUseCase, getStoreItemCategoryByIdUseCase: GetStoreItemCategoryByIdUseCase, listStoreItemCategoriesUseCase: ListStoreItemCategoriesUseCase, getItemCategoryTreeUseCase: GetItemCategoryTreeUseCase, updateStoreItemCategoryUseCase: UpdateStoreItemCategoryUseCase, deleteStoreItemCategoryUseCase: DeleteStoreItemCategoryUseCase);
    create(dto: CreateStoreItemCategoryDto): Promise<StoreItemCategory>;
    findById(id: string): Promise<StoreItemCategory>;
    findAll(parentId?: string | null, pagination?: Pagination): Promise<PaginatedResult<StoreItemCategory>>;
    getTree(): Promise<ItemCategoryTree[]>;
    update(id: string, dto: UpdateStoreItemCategoryDto): Promise<StoreItemCategory>;
    delete(id: string): Promise<void>;
}
