import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { type IExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository.interface';
import { PrismaService } from '~common/prisma/prisma.service';

@Injectable()
export class DeleteExpenseCategoryUseCase {
  constructor(
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.expenseCategoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    await this.validate(id);

    await this.expenseCategoryRepository.delete(id);
  }

  private async validate(id: string): Promise<void> {
    // Check if category has children
    const children = await this.expenseCategoryRepository.findChildren(id);
    if (children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with child categories',
      );
    }

    // Check if category is used by any expenses
    const expenseCount = await this.prisma.expense.count({
      where: { categoryId: id },
    });
    if (expenseCount > 0) {
      throw new BadRequestException(
        'Cannot delete category that is used by existing expenses',
      );
    }
  }
}
