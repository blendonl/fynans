import { type IIncomeCategoryRepository, PaginatedResult } from '../../domain/repositories/income-category.repository.interface';
import { IncomeCategory } from '../../domain/entities/income-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
export declare class ListIncomeCategoriesUseCase {
    private readonly incomeCategoryRepository;
    constructor(incomeCategoryRepository: IIncomeCategoryRepository);
    execute(parentId?: string | null, pagination?: Pagination): Promise<PaginatedResult<IncomeCategory>>;
}
