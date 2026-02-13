import { Injectable, Inject, BadRequestException } from '@nestjs/common';
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
    await this.validate(dto);

    const existing = await this.expenseCategoryRepository.findByName(dto.name);
    if (existing) {
      await this.expenseCategoryRepository.linkToUser(existing.id, userId);
      return existing;
    }

    const category = await this.expenseCategoryRepository.create({
      name: dto.name,
      parentId: dto.parentId ?? null,
      isConnectedToStore: dto.isConnectedToStore,
    } as Partial<ExpenseCategory>);

    await this.expenseCategoryRepository.linkToUser(category.id, userId);

    return category;
  }

  private async validate(dto: CreateExpenseCategoryDto): Promise<void> {
    if (!dto.parentId) {
      return;
    }

    const parent = await this.expenseCategoryRepository.findById(dto.parentId);

    if (!parent) {
      throw new BadRequestException('Parent category not found');
    }
  }
}
