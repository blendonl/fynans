import { StoreItem } from '../../core/domain/entities/store-item.entity';

export class StoreItemResponseDto {
  id: string;
  storeId: string;
  name: string;
  price: number;
  isDiscounted: boolean;
  categoryId: string;
  sizes: { id: string; value: number; unit: string }[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(storeItem: StoreItem): StoreItemResponseDto {
    const dto = new StoreItemResponseDto();
    dto.id = storeItem.id;
    dto.storeId = storeItem.storeId;
    dto.name = storeItem.item?.name ?? '';
    dto.price = storeItem.price.toNumber();
    dto.isDiscounted = storeItem.isDiscounted;
    dto.createdAt = storeItem.createdAt;
    dto.updatedAt = storeItem.updatedAt;
    dto.categoryId = storeItem.item?.categoryId ?? '';
    dto.sizes = (storeItem.item?.sizes ?? []).map((s) => ({
      id: s.id,
      value: s.value.toNumber(),
      unit: s.unit,
    }));

    return dto;
  }

  static fromEntities(storeItems: StoreItem[]): StoreItemResponseDto[] {
    return storeItems.map((storeItem) => this.fromEntity(storeItem));
  }
}
