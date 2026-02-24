import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionResponseDto } from '~feature/transaction/rest';
import { Expense } from '../../core/domain/entities/expense.entity';
import { ExpenseCategoryResponseDto } from '~feature/expense-category/rest/dto/expense-category-response.dto';
import { StoreResponseDto } from '~feature/store/rest/dto/store-response.dto';
import { ExpenseItemResponseDto } from '~feature/expense-item/rest/dto/expense-item-response.dto';

export class ExpenseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ nullable: true })
  storeId: string | null;

  @ApiProperty({ type: () => TransactionResponseDto })
  transaction: TransactionResponseDto;

  @ApiProperty({ type: () => ExpenseCategoryResponseDto })
  category: ExpenseCategoryResponseDto;

  @ApiProperty({ type: () => StoreResponseDto, nullable: true })
  store: StoreResponseDto | null;

  @ApiProperty({ type: () => [ExpenseItemResponseDto] })
  items: ExpenseItemResponseDto[];

  @ApiProperty({ type: () => [ExpenseItemResponseDto], required: false })
  matchedItems?: ExpenseItemResponseDto[];

  @ApiProperty()
  name: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(expense: Expense): ExpenseResponseDto {
    const dto = new ExpenseResponseDto();
    dto.id = expense.id;
    dto.transactionId = expense.transactionId;
    dto.categoryId = expense.categoryId;
    dto.storeId = expense.storeId;
    dto.status = expense.transaction.status;
    dto.rejectionReason = expense.transaction.rejectionReason;
    dto.createdAt = expense.createdAt;
    dto.updatedAt = expense.updatedAt;
    dto.category = ExpenseCategoryResponseDto.fromEntity(expense.category);
    dto.transaction = TransactionResponseDto.fromEntity(expense.transaction);
    dto.store = expense.store ? StoreResponseDto.fromEntity(expense.store) : null;
    dto.items = ExpenseItemResponseDto.fromEntities(expense.items);
    return dto;
  }

  static fromEntities(expenses: Expense[]): ExpenseResponseDto[] {
    return expenses.map((expense) => this.fromEntity(expense));
  }
}
