import { Income } from '../entities/income.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { TransactionScope } from '../../../../transaction/core/domain/entities/transaction.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IncomeFilters {
  userId?: string;
  categoryId?: string;
  storeId?: string;
  familyId?: string;
  scope?: TransactionScope;
  dateFrom?: Date;
  dateTo?: Date;
  valueMin?: number;
  valueMax?: number;
}

export interface IIncomeRepository {
  create(data: Partial<Income>): Promise<Income>;
  findById(id: string): Promise<Income | null>;
  findByTransactionId(transactionId: string): Promise<Income | null>;
  findAll(filters?: IncomeFilters, pagination?: Pagination): Promise<PaginatedResult<Income>>;
  update(id: string, data: Partial<Income>): Promise<Income>;
  delete(id: string): Promise<void>;
}
