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
import { Pagination } from '~common/dto/pagination.dto';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

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

  private validateOwnership(income: Income, userId: string): void {
    if (income.transaction && income.transaction.userId !== userId) {
      throw new DomainForbiddenException('Access denied');
    }
  }

  async findById(id: string, userId?: string): Promise<Income> {
    const income = await this.getIncomeByIdUseCase.execute(id);
    if (userId) {
      this.validateOwnership(income, userId);
    }
    return income;
  }

  async findByTransactionId(
    transactionId: string,
    userId?: string,
  ): Promise<Income> {
    const income =
      await this.getIncomeByTransactionIdUseCase.execute(transactionId);
    if (userId) {
      this.validateOwnership(income, userId);
    }
    return income;
  }

  async findAll(
    userId: string,
    filters?: IncomeFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Income>> {
    return this.listIncomesUseCase.execute(userId, filters, pagination);
  }

  async update(
    id: string,
    dto: UpdateIncomeDto,
    userId?: string,
  ): Promise<Income> {
    if (userId) {
      await this.findById(id, userId);
    }
    return this.updateIncomeUseCase.execute(id, dto);
  }

  async delete(id: string, userId?: string): Promise<void> {
    if (userId) {
      await this.findById(id, userId);
    }
    return this.deleteIncomeUseCase.execute(id);
  }
}
