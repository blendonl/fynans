import { type IIncomeRepository, PaginatedResult } from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { IncomeFilters } from '../dto/income-filters.dto';
import { VerifyFamilyMembershipUseCase } from '../../../../family/core/application/use-cases/verify-family-membership.use-case';
export declare class ListIncomesUseCase {
    private readonly incomeRepository;
    private readonly verifyFamilyMembershipUseCase;
    constructor(incomeRepository: IIncomeRepository, verifyFamilyMembershipUseCase: VerifyFamilyMembershipUseCase);
    execute(userId: string, filters?: IncomeFilters, pagination?: Pagination): Promise<PaginatedResult<Income>>;
}
