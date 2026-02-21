import { ApiProperty } from '@nestjs/swagger';
import { Item } from '../../core/domain/entities/item.entity';

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
    return {
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
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
