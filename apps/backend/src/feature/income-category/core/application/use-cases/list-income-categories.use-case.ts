import { Injectable, Inject } from '@nestjs/common';
import {
  type IIncomeCategoryRepository,
  PaginatedResult,
} from '../../domain/repositories/income-category.repository.interface';
import { IncomeCategory } from '../../domain/entities/income-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

@Injectable()
export class ListIncomeCategoriesUseCase {
  constructor(
    @Inject('IncomeCategoryRepository')
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(
    userId: string,
    parentId?: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<IncomeCategory>> {
    if (parentId !== undefined) {
      return this.incomeCategoryRepository.findByParentId(
        userId,
        parentId,
        pagination,
      );
    }

    return this.incomeCategoryRepository.findAll(userId, pagination);
  }
}
