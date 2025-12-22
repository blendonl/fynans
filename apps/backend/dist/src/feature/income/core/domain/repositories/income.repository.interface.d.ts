import { Income } from '../entities/income.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
export interface PaginatedResult<T> {
    data: T[];
    total: number;
}
export interface IIncomeRepository {
    create(data: Partial<Income>): Promise<Income>;
    findById(id: string): Promise<Income | null>;
    findByTransactionId(transactionId: string): Promise<Income | null>;
    findByStoreId(storeId: string, pagination?: Pagination): Promise<PaginatedResult<Income>>;
    findAll(pagination?: Pagination): Promise<PaginatedResult<Income>>;
    update(id: string, data: Partial<Income>): Promise<Income>;
    delete(id: string): Promise<void>;
}
