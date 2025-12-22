import { StoreItemCategoryService } from '../../core/application/services/store-item-category.service';
import { CreateStoreItemCategoryRequestDto } from '../dto/create-store-item-category-request.dto';
import { UpdateStoreItemCategoryRequestDto } from '../dto/update-store-item-category-request.dto';
import { StoreItemCategoryResponseDto } from '../dto/store-item-category-response.dto';
export declare class StoreItemCategoryController {
    private readonly storeItemCategoryService;
    constructor(storeItemCategoryService: StoreItemCategoryService);
    create(createDto: CreateStoreItemCategoryRequestDto): Promise<StoreItemCategoryResponseDto>;
    findAll(parentId?: string, page?: number, limit?: number): Promise<{
        data: StoreItemCategoryResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTree(): Promise<{
        category: StoreItemCategoryResponseDto;
        children: any;
    }[]>;
    findOne(id: string): Promise<StoreItemCategoryResponseDto>;
    update(id: string, updateDto: UpdateStoreItemCategoryRequestDto): Promise<StoreItemCategoryResponseDto>;
    remove(id: string): Promise<void>;
}
