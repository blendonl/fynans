export class AddBasketItemDto {
  basketId: string;
  name: string;
  quantity: number;
  price?: number | null;
  categoryId?: string | null;
  notes?: string | null;
  addedBy: string;

  constructor(data: {
    basketId: string;
    name: string;
    quantity?: number;
    price?: number | null;
    categoryId?: string | null;
    notes?: string | null;
    addedBy: string;
  }) {
    this.basketId = data.basketId;
    this.name = data.name;
    this.quantity = data.quantity ?? 1;
    this.price = data.price;
    this.categoryId = data.categoryId;
    this.notes = data.notes;
    this.addedBy = data.addedBy;
  }
}
