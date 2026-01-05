import { type IExpenseRepository, PaginatedResult } from '../../domain/repositories/expense.repository.interface';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { VerifyFamilyMembershipUseCase } from '../../../../family/core/application/use-cases/verify-family-membership.use-case';
export declare class ListExpensesUseCase {
    private readonly expenseRepository;
    private readonly verifyFamilyMembershipUseCase;
    constructor(expenseRepository: IExpenseRepository, verifyFamilyMembershipUseCase: VerifyFamilyMembershipUseCase);
    execute(userId: string, filters?: ExpenseFilters, pagination?: Pagination): Promise<PaginatedResult<Expense>>;
}
