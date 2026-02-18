import { Basket } from '../entities/basket.entity';
import { BasketItem } from '../entities/basket-item.entity';

export interface IBasketRepository {
  findByUserId(userId: string): Promise<Basket[]>;
  findById(id: string): Promise<Basket | null>;
  upsertPersonal(userId: string): Promise<Basket>;
  upsertFamily(familyId: string, userId: string): Promise<Basket>;

  addItem(data: {
    basketId: string;
    name: string;
    quantity: number;
    price?: number | null;
    categoryId?: string | null;
    notes?: string | null;
    addedBy: string;
  }): Promise<BasketItem>;

  updateItem(
    itemId: string,
    data: {
      name?: string;
      quantity?: number;
      price?: number | null;
      categoryId?: string | null;
      notes?: string | null;
    },
  ): Promise<BasketItem>;

  removeItem(itemId: string): Promise<void>;

  findItemById(itemId: string): Promise<BasketItem | null>;

  findItemsByIds(itemIds: string[]): Promise<BasketItem[]>;

  removeItemsByIds(itemIds: string[]): Promise<void>;
}
