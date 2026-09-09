import { Injectable, Inject } from '@nestjs/common';
import { type ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { TransactionFilters } from '../dto/transaction-filters.dto';
import { TransactionStatistics } from '../dto/transaction-statistics.dto';

@Injectable()
export class GetTransactionStatisticsUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) { }

  async execute(filters: TransactionFilters): Promise<TransactionStatistics> {
    return this.transactionRepository.getStatistics(filters);
  }
}
