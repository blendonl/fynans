import { Injectable, Inject } from '@nestjs/common';
import {
  type ITransactionRepository,
  PaginatedResult,
} from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionFilters } from '../dto/transaction-filters.dto';
import { Pagination } from '../dto/pagination.dto';

@Injectable()
export class ListTransactionsUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    filters?: TransactionFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Transaction>> {
    return this.transactionRepository.findAll(filters, pagination);
  }
}
