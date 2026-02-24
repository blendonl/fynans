import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../value-objects/transaction-status.vo';
import { TransactionFilters } from '../../application/dto/transaction-filters.dto';
import { Pagination } from '../../application/dto/pagination.dto';
import { TransactionStatistics } from '../../application/dto/transaction-statistics.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface ITransactionRepository {
  create(data: Partial<Transaction>): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(
    userId: string,
    filters?: TransactionFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Transaction>>;
  findAll(
    filters?: TransactionFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Transaction>>;
  update(id: string, data: Partial<Transaction>): Promise<Transaction>;
  updateStatus(id: string, status: TransactionStatus, rejectionReason?: string): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getStatistics(
    userId?: string,
    filters?: TransactionFilters,
  ): Promise<TransactionStatistics>;
}
