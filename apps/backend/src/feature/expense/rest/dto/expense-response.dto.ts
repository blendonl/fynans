import { TransactionResponseDto } from '~feature/transaction/rest';
import { Expense } from '../../core/domain/entities/expense.entity';
import { ExpenseCategoryResponseDto } from '~feature/expense-category/rest/dto/expense-category-response.dto';
import { StoreResponseDto } from '~feature/store/rest/dto/store-response.dto';
import { ExpenseItemResponseDto } from '~feature/expense-item/rest/dto/expense-item-response.dto';

export class ExpenseResponseDto {
  id: string;
  transactionId: string;
  categoryId: string;
  storeId: string | null;
  transaction: TransactionResponseDto;
  category: ExpenseCategoryResponseDto;
  store: StoreResponseDto | null;
  items: ExpenseItemResponseDto[];
  matchedItems?: ExpenseItemResponseDto[];
  name: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(expense: Expense): ExpenseResponseDto {
    const dto = new ExpenseResponseDto();
    dto.id = expense.id;
    dto.transactionId = expense.transactionId;
    dto.categoryId = expense.categoryId;
    dto.storeId = expense.storeId;
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
