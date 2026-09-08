import { ExpenseItem } from '../entities/expense-item.entity';
import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';
import { OwnerScope } from '~common/authorization/domain/owner-scope';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export { PaginatedResult };

export interface CreateExpenseItemData {
  itemId: string;
  expenseId: string;
  price: Decimal | number | string;
  discount: Decimal | number | string;
  quantity: Decimal | number;
}

export interface UpdateExpenseItemData {
  categoryId?: string;
  price?: Decimal;
  discount?: Decimal;
}

export interface IExpenseItemRepository {
  create(data: CreateExpenseItemData): Promise<ExpenseItem>;
  findById(id: string): Promise<ExpenseItem | null>;
  findByExpenseId(expenseId: string, scope: OwnerScope): Promise<ExpenseItem[]>;
  findAll(
    scope: OwnerScope,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ExpenseItem>>;
  update(id: string, data: UpdateExpenseItemData): Promise<ExpenseItem>;
  delete(id: string): Promise<void>;
  calculateExpenseTotal(expenseId: string): Promise<number>;
}
