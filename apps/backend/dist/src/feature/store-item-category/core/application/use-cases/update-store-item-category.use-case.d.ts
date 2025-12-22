import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
import { UpdateStoreItemCategoryDto } from '../dto/update-store-item-category.dto';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
export declare class UpdateStoreItemCategoryUseCase {
    private readonly storeItemCategoryRepository;
    constructor(storeItemCategoryRepository: IStoreItemCategoryRepository);
    execute(id: string, dto: UpdateStoreItemCategoryDto): Promise<StoreItemCategory>;
    private validate;
    private checkCircularReference;
}
