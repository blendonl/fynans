export interface ItemOverride {
  id: string;
  price?: number;
  quantity?: number;
  categoryId?: string;
}

export class CheckoutBasketItemsDto {
  basketId: string;
  itemIds: string[];
  categoryId: string;
  userId: string;
  familyId?: string;
  storeId?: string;
  itemOverrides?: ItemOverride[];
  recordedAt?: Date;

  constructor(data: {
    basketId: string;
    itemIds: string[];
    categoryId: string;
    userId: string;
    familyId?: string;
    storeId?: string;
    itemOverrides?: ItemOverride[];
    recordedAt?: Date;
  }) {
    this.basketId = data.basketId;
    this.itemIds = data.itemIds;
    this.categoryId = data.categoryId;
    this.userId = data.userId;
    this.familyId = data.familyId;
    this.storeId = data.storeId;
    this.itemOverrides = data.itemOverrides;
    this.recordedAt = data.recordedAt;
  }
}
