import { ApiProperty } from '@nestjs/swagger';
import { Item } from '../../core/domain/entities/item.entity';
import { type ItemDetailResult } from '../../core/domain/repositories/item.repository.interface';

export class ItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(item: Item): ItemResponseDto {
    const dto = new ItemResponseDto();
    dto.id = item.id;
    dto.name = item.name;
    dto.categoryId = item.categoryId;
    dto.createdAt = item.createdAt;
    dto.updatedAt = item.updatedAt;
    return dto;
  }

  static fromEntities(items: Item[]): ItemResponseDto[] {
    return items.map((item) => this.fromEntity(item));
  }
}

export class ItemWithStoresResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  minPrice: number;

  @ApiProperty()
  maxPrice: number;

  @ApiProperty()
  storeCount: number;
}

export class PaginatedItemResponseDto {
  @ApiProperty({ type: [ItemResponseDto] })
  data: ItemResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class ItemStoreLinkDto {
  @ApiProperty()
  storeItemId: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty()
  storeLocation: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  isDiscounted: boolean;
}

export class ItemCategoryInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class ItemDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ type: ItemCategoryInfoDto })
  category: ItemCategoryInfoDto;

  @ApiProperty({ type: [ItemStoreLinkDto] })
  stores: ItemStoreLinkDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDetail(detail: ItemDetailResult): ItemDetailResponseDto {
    const dto = new ItemDetailResponseDto();
    dto.id = detail.item.id;
    dto.name = detail.item.name;
    dto.categoryId = detail.item.categoryId;
    dto.category = detail.category;
    dto.stores = detail.stores;
    dto.createdAt = detail.item.createdAt;
    dto.updatedAt = detail.item.updatedAt;
    return dto;
  }
}

export class PaginatedItemWithStoresResponseDto {
  @ApiProperty({ type: [ItemWithStoresResponseDto] })
  data: ItemWithStoresResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
