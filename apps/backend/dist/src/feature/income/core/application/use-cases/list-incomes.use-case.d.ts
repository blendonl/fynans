import { type IIncomeRepository, PaginatedResult } from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
export declare class ListIncomesUseCase {
    private readonly incomeRepository;
    constructor(incomeRepository: IIncomeRepository);
    execute(storeId?: string, pagination?: Pagination): Promise<PaginatedResult<Income>>;
}
