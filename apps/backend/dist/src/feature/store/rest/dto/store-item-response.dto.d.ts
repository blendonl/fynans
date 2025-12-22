import { StoreItem } from '../../core/domain/entities/store-item.entity';
export declare class StoreItemResponseDto {
    id: string;
    storeId: string;
    name: string;
    price: number;
    isDiscounted: boolean;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(storeItem: StoreItem): StoreItemResponseDto;
    static fromEntities(storeItems: StoreItem[]): StoreItemResponseDto[];
}
