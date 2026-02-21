import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreItem } from '../../core/domain/entities/store-item.entity';

export class StoreItemSizeDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  unit: string;
}

export class StoreItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  isDiscounted: boolean;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ type: () => [StoreItemSizeDto] })
  sizes: { id: string; value: number; unit: string }[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
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
