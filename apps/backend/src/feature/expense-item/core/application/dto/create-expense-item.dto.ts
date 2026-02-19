export class CreateExpenseItemDto {
  expenseId: string;
  categoryId: string;
  itemName: string;
  itemPrice: number;
  discount?: number;
  quantity?: number;
  itemId?: string;
  sizeValue?: number;
  sizeUnit?: string;

  constructor(data: {
    expenseId: string;
    categoryId: string;
    itemName: string;
    itemPrice: number;
    discount?: number;
    quantity?: number;
    itemId?: string;
    sizeValue?: number;
    sizeUnit?: string;
  }) {
    this.expenseId = data.expenseId;
    this.categoryId = data.categoryId;
    this.itemName = data.itemName;
    this.itemPrice = data.itemPrice;
    this.discount = data.discount ?? 0;
    this.quantity = data.quantity ?? 1;
    this.itemId = data.itemId;
    this.sizeValue = data.sizeValue;
    this.sizeUnit = data.sizeUnit;
  }
}
