export type BasketScope = 'PERSONAL' | 'FAMILY';

export interface BasketItem {
  id: string;
  basketId: string;
  name: string;
  quantity: number;
  price: number | null;
  categoryId: string | null;
  categoryName?: string | null;
  notes: string | null;
  addedBy: string;
  addedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemWithPrices {
  id: string;
  name: string;
  categoryId: string;
  minPrice: number;
  maxPrice: number;
  storeCount: number;
}

export interface Basket {
  id: string;
  userId: string;
  familyId: string | null;
  familyName?: string;
  scope: BasketScope;
  items: BasketItem[];
  createdAt: string;
  updatedAt: string;
}
