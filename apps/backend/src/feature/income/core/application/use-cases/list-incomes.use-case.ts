import { Injectable, Inject } from '@nestjs/common';
import {
  type IIncomeRepository,
  PaginatedResult,
} from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { IncomeFilters } from '../dto/income-filters.dto';
import { FamilyService } from '../../../../family/core/application/services/family.service';

@Injectable()
export class ListIncomesUseCase {
  constructor(
    @Inject('IncomeRepository')
    private readonly incomeRepository: IIncomeRepository,
    private readonly familyService: FamilyService,
  ) {}

  async execute(
    userId: string,
    filters?: IncomeFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Income>> {
    // Verify family membership if familyId is provided
    if (filters?.familyId) {
      await this.familyService.verifyMembership(
        filters.familyId,
        userId,
      );
    }

    return this.incomeRepository.findAll(filters, pagination);
  }
}
