import { Injectable, Inject } from '@nestjs/common';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
import { type IExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository.interface';
import { CreateExpenseCategoryDto } from '../dto/create-expense-category.dto';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';

@Injectable()
export class CreateExpenseCategoryUseCase {
  constructor(
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
  ) {}

  async execute(
    dto: CreateExpenseCategoryDto,
    userId: string,
  ): Promise<ExpenseCategory> {
    await this.validate(dto, userId);

    const existing = await this.expenseCategoryRepository.findOwnedByName(
      dto.name,
      userId,
    );
    if (existing) {
      return existing;
    }

    return this.expenseCategoryRepository.create({
      userId,
      name: dto.name,
      parentId: dto.parentId ?? null,
      isConnectedToStore: dto.isConnectedToStore,
    });
  }

  private async validate(
    dto: CreateExpenseCategoryDto,
    userId: string,
  ): Promise<void> {
    if (!dto.parentId) {
      return;
    }

    const parent = await this.expenseCategoryRepository.findById(dto.parentId);

    if (!parent || parent.userId !== userId) {
      throw new DomainValidationException('Parent category not found');
    }
  }
}
