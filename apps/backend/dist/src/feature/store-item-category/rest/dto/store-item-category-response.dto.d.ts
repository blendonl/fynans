import { StoreItemCategory } from '../../core/domain/entities/store-item-category.entity';
export declare class StoreItemCategoryResponseDto {
    id: string;
    parentId: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(category: StoreItemCategory): StoreItemCategoryResponseDto;
    static fromEntities(categories: StoreItemCategory[]): StoreItemCategoryResponseDto[];
}
