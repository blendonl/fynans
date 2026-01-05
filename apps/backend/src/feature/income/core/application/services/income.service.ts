import { Injectable } from '@nestjs/common';
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

@Injectable()
export class IncomeService {
  constructor(
    private readonly createIncomeUseCase: CreateIncomeUseCase,
    private readonly getIncomeByIdUseCase: GetIncomeByIdUseCase,
    private readonly getIncomeByTransactionIdUseCase: GetIncomeByTransactionIdUseCase,
    private readonly listIncomesUseCase: ListIncomesUseCase,
    private readonly updateIncomeUseCase: UpdateIncomeUseCase,
    private readonly deleteIncomeUseCase: DeleteIncomeUseCase,
  ) {}

  async create(dto: CreateIncomeDto): Promise<Income> {
    return this.createIncomeUseCase.execute(dto);
  }

  async findById(id: string): Promise<Income> {
    return this.getIncomeByIdUseCase.execute(id);
  }

  async findByTransactionId(transactionId: string): Promise<Income> {
    return this.getIncomeByTransactionIdUseCase.execute(transactionId);
  }

  async findAll(
    userId: string,
    filters?: IncomeFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Income>> {
    return this.listIncomesUseCase.execute(userId, filters, pagination);
  }

  async update(id: string, dto: UpdateIncomeDto): Promise<Income> {
    return this.updateIncomeUseCase.execute(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.deleteIncomeUseCase.execute(id);
  }
}
