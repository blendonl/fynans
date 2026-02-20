import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';

@Injectable()
export class DeleteIncomeUseCase {
  constructor(
    @Inject('IncomeRepository')
    private readonly incomeRepository: IIncomeRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const income = await this.incomeRepository.findById(id);

    if (!income) {
      throw new DomainNotFoundException('Income not found');
    }

    await this.incomeRepository.delete(id);
  }
}
