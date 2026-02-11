import { ExpenseItem } from '../../core/domain/entities/expense-item.entity';

export class ExpenseItemResponseDto {
  id: string;
  itemId: string;
  name: string;
  expenseId: string;
  categoryId: string;
  price: number;
  discount: number;
  finalPrice: number;
  discountPercentage: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(item: ExpenseItem): ExpenseItemResponseDto {
    const dto = new ExpenseItemResponseDto();
    dto.id = item.id;
    dto.itemId = item.itemId;
    dto.name = item.itemName;
    dto.expenseId = item.expenseId;
    dto.categoryId = item.categoryId;
    dto.price = item.price.toNumber();
    dto.discount = item.discount.toNumber();
    dto.finalPrice = item.getFinalPrice().toNumber();
    dto.discountPercentage = item.getDiscountPercentage();
    dto.createdAt = item.createdAt;
    dto.updatedAt = item.updatedAt;
    dto.quantity = item.quantity.toNumber();
    return dto;
  }

  static fromEntities(items: ExpenseItem[]): ExpenseItemResponseDto[] {
    return items.map((item) => this.fromEntity(item));
  }
}
