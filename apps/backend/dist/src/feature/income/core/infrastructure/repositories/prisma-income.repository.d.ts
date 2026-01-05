import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { IIncomeRepository, PaginatedResult, IncomeFilters as IncomeFiltersInterface } from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
export declare class PrismaIncomeRepository implements IIncomeRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<Income>): Promise<Income>;
    findById(id: string): Promise<Income | null>;
    findByTransactionId(transactionId: string): Promise<Income | null>;
    findByStoreId(storeId: string, pagination?: Pagination): Promise<PaginatedResult<Income>>;
    findAll(filters?: IncomeFiltersInterface, pagination?: Pagination): Promise<PaginatedResult<Income>>;
    update(id: string, data: Partial<Income>): Promise<Income>;
    delete(id: string): Promise<void>;
    private buildWhereClause;
}
