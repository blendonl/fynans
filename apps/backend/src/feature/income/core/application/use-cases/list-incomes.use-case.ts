import { Injectable, Inject } from '@nestjs/common';
import {
  type IIncomeRepository,
  PaginatedResult,
} from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { IncomeFilters } from '../dto/income-filters.dto';
import { VerifyFamilyMembershipUseCase } from '../../../../family/core/application/use-cases/verify-family-membership.use-case';

@Injectable()
export class ListIncomesUseCase {
  constructor(
    @Inject('IncomeRepository')
    private readonly incomeRepository: IIncomeRepository,
    private readonly verifyFamilyMembershipUseCase: VerifyFamilyMembershipUseCase,
  ) {}

  async execute(
    userId: string,
    filters?: IncomeFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Income>> {
    // Verify family membership if familyId is provided
    if (filters?.familyId) {
      await this.verifyFamilyMembershipUseCase.execute(
        filters.familyId,
        userId,
      );
    }

    return this.incomeRepository.findAll(filters, pagination);
  }
}
