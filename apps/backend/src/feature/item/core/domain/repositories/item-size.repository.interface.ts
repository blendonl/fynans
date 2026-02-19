import { ItemSize } from '../entities/item-size.entity';

export interface IItemSizeRepository {
  create(data: { itemId: string; value: number; unit: string }): Promise<ItemSize>;
  findByItemAndSize(itemId: string, value: number, unit: string): Promise<ItemSize | null>;
  findByItemId(itemId: string): Promise<ItemSize[]>;
}
