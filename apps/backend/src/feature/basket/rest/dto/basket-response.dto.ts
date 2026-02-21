import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Basket } from '../../core/domain/entities/basket.entity';
import { BasketItem } from '../../core/domain/entities/basket-item.entity';

export class BasketItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  basketId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ nullable: true })
  price: number | null;

  @ApiProperty({ nullable: true })
  categoryId: string | null;

  @ApiProperty({ nullable: true })
  categoryName: string | null;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty()
  addedBy: string;

  @ApiPropertyOptional()
  addedByName?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromEntity(item: BasketItem): BasketItemResponseDto {
    const dto = new BasketItemResponseDto();
    dto.id = item.id;
    dto.basketId = item.basketId;
    dto.name = item.name;
    dto.quantity = item.quantity;
    dto.price = item.price;
    dto.categoryId = item.categoryId;
    dto.categoryName = item.categoryName;
    dto.notes = item.notes;
    dto.addedBy = item.addedBy;
    dto.addedByName = item.addedByName;
    dto.createdAt = item.createdAt.toISOString();
    dto.updatedAt = item.updatedAt.toISOString();
    return dto;
  }
}

export class BasketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ nullable: true })
  familyId: string | null;

  @ApiPropertyOptional()
  familyName?: string;

  @ApiProperty()
  scope: string;

  @ApiProperty({ type: () => [BasketItemResponseDto] })
  items: BasketItemResponseDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromEntity(basket: Basket): BasketResponseDto {
    const dto = new BasketResponseDto();
    dto.id = basket.id;
    dto.userId = basket.userId;
    dto.familyId = basket.familyId;
    dto.familyName = basket.familyName;
    dto.scope = basket.scope;
    dto.items = basket.items.map(BasketItemResponseDto.fromEntity);
    dto.createdAt = basket.createdAt.toISOString();
    dto.updatedAt = basket.updatedAt.toISOString();
    return dto;
  }
}
