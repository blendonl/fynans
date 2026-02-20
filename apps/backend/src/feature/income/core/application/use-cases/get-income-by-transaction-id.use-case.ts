import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';

@Injectable()
export class GetIncomeByTransactionIdUseCase {
  constructor(
    @Inject('IncomeRepository')
    private readonly incomeRepository: IIncomeRepository,
  ) {}

  async execute(transactionId: string): Promise<Income> {
    const income = await this.incomeRepository.findByTransactionId(transactionId);

    if (!income) {
      throw new DomainNotFoundException('Income not found for this transaction');
    }

    return income;
  }
}
