import { ApiProperty } from '@nestjs/swagger';
import { ExpenseItem } from '../../core/domain/entities/expense-item.entity';

export class ExpenseItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  itemId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  expenseId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty()
  discountPercentage: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
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

export class PaginatedExpenseItemResponseDto {
  @ApiProperty({ type: [ExpenseItemResponseDto] })
  data: ExpenseItemResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
