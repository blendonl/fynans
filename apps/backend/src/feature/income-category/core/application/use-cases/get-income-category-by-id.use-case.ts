import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IIncomeCategoryRepository } from '../../domain/repositories/income-category.repository.interface';
import { IncomeCategory } from '../../domain/entities/income-category.entity';

@Injectable()
export class GetIncomeCategoryByIdUseCase {
  constructor(
    @Inject('IncomeCategoryRepository')
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(id: string): Promise<IncomeCategory> {
    const category = await this.incomeCategoryRepository.findById(id);

    if (!category) {
      throw new DomainNotFoundException('Income category not found');
    }

    return category;
  }
}
