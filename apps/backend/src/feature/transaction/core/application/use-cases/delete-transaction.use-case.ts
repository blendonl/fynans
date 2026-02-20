import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';

@Injectable()
export class DeleteTransactionUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) { }

  async execute(id: string): Promise<void> {
    const existingTransaction = await this.transactionRepository.findById(id);
    if (!existingTransaction) {
      throw new DomainNotFoundException(`Transaction with ID ${id} not found`);
    }

    await this.transactionRepository.delete(id);
  }
}
