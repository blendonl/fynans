import { Injectable, Inject } from '@nestjs/common';
import {
  type IExpenseItemRepository,
  PaginatedResult,
} from '../../domain/repositories/expense-item.repository.interface';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { ResolveOwnerScopeUseCase } from '~common/authorization/application/use-cases/resolve-owner-scope.use-case';

@Injectable()
export class ListExpenseItemsUseCase {
  constructor(
    @Inject('ExpenseItemRepository')
    private readonly expenseItemRepository: IExpenseItemRepository,
    private readonly resolveOwnerScopeUseCase: ResolveOwnerScopeUseCase,
  ) {}

  async execute(
    userId: string,
    expenseId?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ExpenseItem>> {
    const scope = await this.resolveOwnerScopeUseCase.execute(userId);

    if (expenseId) {
      const items = await this.expenseItemRepository.findByExpenseId(
        expenseId,
        scope,
      );

      return {
        data: items,
        total: items.length,
      };
    }

    return this.expenseItemRepository.findAll(scope, pagination);
  }
}
