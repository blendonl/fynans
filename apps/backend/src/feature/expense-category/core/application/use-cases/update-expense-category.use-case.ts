import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { type IExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository.interface';
import { UpdateExpenseCategoryDto } from '../dto/update-expense-category.dto';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';

@Injectable()
export class UpdateExpenseCategoryUseCase {
  constructor(
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    const category = await this.expenseCategoryRepository.findById(id);

    if (!category) {
      throw new DomainNotFoundException('Expense category not found');
    }

    await this.validate(id, dto);

    const updated = await this.expenseCategoryRepository.update(id, {
      name: dto.name,
      parentId: dto.parentId,
      isConnectedToStore: dto.isConnectedToStore,
    });

    return updated;
  }

  private async validate(
    id: string,
    dto: UpdateExpenseCategoryDto,
  ): Promise<void> {
    if (dto.name) {
      const existingCategory =
        await this.expenseCategoryRepository.findByName(dto.name);
      if (existingCategory && existingCategory.id !== id) {
        throw new DomainValidationException('Category name must be unique');
      }
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new DomainValidationException('Category cannot be its own parent');
      }

      if (dto.parentId !== null) {
        const parent =
          await this.expenseCategoryRepository.findById(dto.parentId);
        if (!parent) {
          throw new DomainValidationException('Parent category not found');
        }

        await this.checkCircularReference(id, dto.parentId);
      }
    }
  }

  private async checkCircularReference(
    categoryId: string,
    newParentId: string,
  ): Promise<void> {
    let currentId: string | null = newParentId;

    while (currentId !== null) {
      if (currentId === categoryId) {
        throw new DomainValidationException('Circular reference detected');
      }

      const current = await this.expenseCategoryRepository.findById(currentId);
      if (!current) {
        break;
      }
      currentId = current.parentId;
    }
  }
}
