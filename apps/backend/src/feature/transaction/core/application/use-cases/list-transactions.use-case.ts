import { Injectable, Inject } from '@nestjs/common';
import {
  type ITransactionRepository,
  PaginatedResult,
} from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionFilters } from '../dto/transaction-filters.dto';
import { Pagination } from '../dto/pagination.dto';
import { FamilyService } from '../../../../family/core/application/services/family.service';

@Injectable()
export class ListTransactionsUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly familyService: FamilyService,
  ) { }

  async execute(
    userId: string,
    filters?: TransactionFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Transaction>> {
    if (filters?.familyId) {
      await this.familyService.verifyMembership(filters.familyId, userId);
    }

    return this.transactionRepository.findAll(filters, pagination);
  }
}
