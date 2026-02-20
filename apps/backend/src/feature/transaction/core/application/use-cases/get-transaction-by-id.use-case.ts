import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';

@Injectable()
export class GetTransactionByIdUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) { }

  async execute(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new DomainNotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }
}
