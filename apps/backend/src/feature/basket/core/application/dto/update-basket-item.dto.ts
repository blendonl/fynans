export class UpdateBasketItemDto {
  name?: string;
  quantity?: number;
  price?: number | null;
  categoryId?: string | null;
  notes?: string | null;

  constructor(data: {
    name?: string;
    quantity?: number;
    price?: number | null;
    categoryId?: string | null;
    notes?: string | null;
  }) {
    this.name = data.name;
    this.quantity = data.quantity;
    this.price = data.price;
    this.categoryId = data.categoryId;
    this.notes = data.notes;
  }
}
