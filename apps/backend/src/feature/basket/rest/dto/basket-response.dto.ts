import { Basket } from '../../core/domain/entities/basket.entity';
import { BasketItem } from '../../core/domain/entities/basket-item.entity';

export class BasketItemResponseDto {
  id: string;
  basketId: string;
  name: string;
  quantity: number;
  price: number | null;
  categoryId: string | null;
  categoryName: string | null;
  notes: string | null;
  addedBy: string;
  addedByName?: string;
  createdAt: string;
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
  id: string;
  userId: string;
  familyId: string | null;
  familyName?: string;
  scope: string;
  items: BasketItemResponseDto[];
  createdAt: string;
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
