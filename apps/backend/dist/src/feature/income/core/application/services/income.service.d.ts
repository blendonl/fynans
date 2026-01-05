import { CreateIncomeUseCase } from '../use-cases/create-income.use-case';
import { GetIncomeByIdUseCase } from '../use-cases/get-income-by-id.use-case';
import { GetIncomeByTransactionIdUseCase } from '../use-cases/get-income-by-transaction-id.use-case';
import { ListIncomesUseCase } from '../use-cases/list-incomes.use-case';
import { UpdateIncomeUseCase } from '../use-cases/update-income.use-case';
import { DeleteIncomeUseCase } from '../use-cases/delete-income.use-case';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { UpdateIncomeDto } from '../dto/update-income.dto';
import { IncomeFilters } from '../dto/income-filters.dto';
import { Income } from '../../domain/entities/income.entity';
import { PaginatedResult } from '../../domain/repositories/income.repository.interface';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
export declare class IncomeService {
    private readonly createIncomeUseCase;
    private readonly getIncomeByIdUseCase;
    private readonly getIncomeByTransactionIdUseCase;
    private readonly listIncomesUseCase;
    private readonly updateIncomeUseCase;
    private readonly deleteIncomeUseCase;
    constructor(createIncomeUseCase: CreateIncomeUseCase, getIncomeByIdUseCase: GetIncomeByIdUseCase, getIncomeByTransactionIdUseCase: GetIncomeByTransactionIdUseCase, listIncomesUseCase: ListIncomesUseCase, updateIncomeUseCase: UpdateIncomeUseCase, deleteIncomeUseCase: DeleteIncomeUseCase);
    create(dto: CreateIncomeDto): Promise<Income>;
    findById(id: string): Promise<Income>;
    findByTransactionId(transactionId: string): Promise<Income>;
    findAll(userId: string, filters?: IncomeFilters, pagination?: Pagination): Promise<PaginatedResult<Income>>;
    update(id: string, dto: UpdateIncomeDto): Promise<Income>;
    delete(id: string): Promise<void>;
}
