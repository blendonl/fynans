import { Injectable } from '@nestjs/common';
import { Pagination } from '~common/dto/pagination.dto';
import { PaginatedResult } from '../../core/domain/repositories/expense.repository.interface';
import { Expense } from '../../core/domain/entities/expense.entity';
import { ExpenseReceiptUrlResolver } from '../../core/application/services/expense-receipt-url.resolver';
import { ExpenseItemResponseDto } from '~feature/expense-item/rest/dto/expense-item-response.dto';
import { ExpenseResponseDto } from '../dto/expense-response.dto';
import { PaginatedExpenseResponseDto } from '../dto/paginated-expense-response.dto';

@Injectable()
export class ExpenseResponseMapper {
  constructor(private readonly receiptUrls: ExpenseReceiptUrlResolver) {}

  async toResponse(expense: Expense): Promise<ExpenseResponseDto> {
    const dto = ExpenseResponseDto.fromEntity(expense);
    dto.receiptImages = await this.receiptUrls.resolve(expense);
    return dto;
  }

  async toPaginatedResponse(
    result: PaginatedResult<Expense>,
    pagination: Pagination,
    searchTerm?: string,
  ): Promise<PaginatedExpenseResponseDto> {
    const receiptImages = await this.receiptUrls.resolveAll(result.data);

    const data = result.data.map((expense, index) => {
      const dto = ExpenseResponseDto.fromEntity(expense);
      dto.receiptImages = receiptImages[index];
      if (searchTerm) {
        dto.matchedItems = ExpenseItemResponseDto.fromEntities(
          expense.itemsMatching(searchTerm),
        );
      }
      return dto;
    });

    return {
      data,
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }
}
