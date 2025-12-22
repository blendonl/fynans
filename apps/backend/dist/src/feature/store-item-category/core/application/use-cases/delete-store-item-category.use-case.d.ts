import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
export declare class DeleteStoreItemCategoryUseCase {
    private readonly storeItemCategoryRepository;
    constructor(storeItemCategoryRepository: IStoreItemCategoryRepository);
    execute(id: string): Promise<void>;
    private validate;
}
