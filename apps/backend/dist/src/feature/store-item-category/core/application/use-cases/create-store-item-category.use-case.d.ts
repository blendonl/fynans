import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
import { CreateStoreItemCategoryDto } from '../dto/create-store-item-category.dto';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
export declare class CreateStoreItemCategoryUseCase {
    private readonly storeItemCategoryRepository;
    constructor(storeItemCategoryRepository: IStoreItemCategoryRepository);
    execute(dto: CreateStoreItemCategoryDto): Promise<StoreItemCategory>;
    private validate;
}
