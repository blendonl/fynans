import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../../core/application/use-cases/create-transaction.use-case';
import { GetTransactionByIdUseCase } from '../../core/application/use-cases/get-transaction-by-id.use-case';
import { ListTransactionsUseCase } from '../../core/application/use-cases/list-transactions.use-case';
import { UpdateTransactionUseCase } from '../../core/application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from '../../core/application/use-cases/delete-transaction.use-case';
import { GetTransactionStatisticsUseCase } from '../../core/application/use-cases/get-transaction-statistics.use-case';
import { GetTransactionStatisticsComparisonUseCase } from '../../core/application/use-cases/get-transaction-statistics-comparison.use-case';
import { ExportTransactionsUseCase } from '../../core/application/use-cases/export-transactions.use-case';
import { CreateTransactionRequestDto } from '../dto/create-transaction-request.dto';
import { UpdateTransactionRequestDto } from '../dto/update-transaction-request.dto';
import { QueryTransactionDto } from '../dto/query-transaction.dto';
import { ExportTransactionQueryDto } from '../dto/export-transaction-query.dto';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { TransactionStatisticsComparisonResponseDto } from '../dto/transaction-statistics-comparison-response.dto';
import { TransactionFilters } from '../../core/application/dto/transaction-filters.dto';
import { Pagination } from '~common/dto/pagination.dto';
import {
  OwnsResource,
  RequiresFamilyMembership,
  ResourceOwnershipGuard,
} from '~common/authorization';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { RecalculateBalanceUseCase } from '../../../payment-method/core/application/use-cases/recalculate-balance.use-case';

function exportFileName(): string {
  return `fynans-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
}

export class PaginatedTransactionResponseDto {
  @ApiProperty({ type: () => [TransactionResponseDto] })
  data: TransactionResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class TransactionStatisticsResponseDto {
  @ApiProperty()
  totalIncome: number;

  @ApiProperty()
  totalExpense: number;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  count: number;
}

@ApiTags('Transaction')
@ApiBearerAuth('bearer')
@UseGuards(ResourceOwnershipGuard)
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
    private readonly getTransactionStatisticsUseCase: GetTransactionStatisticsUseCase,
    private readonly getTransactionStatisticsComparisonUseCase: GetTransactionStatisticsComparisonUseCase,
    private readonly exportTransactionsUseCase: ExportTransactionsUseCase,
    private readonly recalculateBalanceUseCase: RecalculateBalanceUseCase,
  ) {}

  private toStatisticsFilters(query: QueryTransactionDto, userId: string) {
    return new TransactionFilters({ ...this.toFilters(query, userId), userId });
  }

  private toFilters(query: QueryTransactionDto, userId: string) {
    return new TransactionFilters({
      userId: query.familyId ? undefined : userId,
      type: query.type,
      familyId: query.familyId,
      scope: query.scope,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
      paymentMethodId: query.paymentMethodId,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiresFamilyMembership()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async create(
    @Body() createDto: CreateTransactionRequestDto,
    @CurrentUser() user: User,
  ) {
    const transaction = await this.createTransactionUseCase.execute(
      createDto.toCoreDto(user.id),
    );

    if (createDto.paymentMethodId) {
      await this.recalculateBalanceUseCase.execute(createDto.paymentMethodId);
    }

    return TransactionResponseDto.fromEntity(transaction);
  }

  @Get()
  @RequiresFamilyMembership()
  @ApiOperation({
    summary: 'List all transactions with pagination and filters',
  })
  @ApiResponse({ status: 200, type: PaginatedTransactionResponseDto })
  async findAll(
    @Query() query: QueryTransactionDto,
    @CurrentUser() user: User,
  ) {
    const pagination = new Pagination(query.page, query.limit);
    const result = await this.listTransactionsUseCase.execute(
      this.toFilters(query, user.id),
      pagination,
    );

    return {
      data: TransactionResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('export')
  @RequiresFamilyMembership()
  @ApiOperation({
    summary: 'Export transactions as CSV',
    description:
      'Streams the transactions the caller can already see through GET /transactions, under the same filters and the same visibility rules. The account is taken from the session, never from a parameter.',
  })
  @ApiResponse({ status: 200, description: 'A CSV document' })
  async export(
    @Query() query: ExportTransactionQueryDto,
    @CurrentUser() user: User,
    @Res() response: Response,
  ) {
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportFileName()}"`,
    );

    try {
      for await (const chunk of this.exportTransactionsUseCase.execute(
        this.toFilters(query, user.id),
      )) {
        response.write(chunk);
      }
    } catch (error) {
      response.destroy(
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }

    response.end();
  }

  @Get('statistics')
  @RequiresFamilyMembership()
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, type: TransactionStatisticsResponseDto })
  async getStatistics(
    @Query() query: QueryTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.getTransactionStatisticsUseCase.execute(
      this.toStatisticsFilters(query, user.id),
    );
  }

  @Get('statistics/comparison')
  @RequiresFamilyMembership()
  @ApiOperation({
    summary: 'Get transaction statistics with period comparison',
  })
  @ApiResponse({
    status: 200,
    type: TransactionStatisticsComparisonResponseDto,
  })
  async getStatisticsComparison(
    @Query() query: QueryTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.getTransactionStatisticsComparisonUseCase.execute(
      this.toStatisticsFilters(query, user.id),
    );
  }

  @Get(':id')
  @OwnsResource({ resource: 'transaction' })
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async findOne(@Param('id') id: string) {
    const transaction = await this.getTransactionByIdUseCase.execute(id);
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Put(':id')
  @OwnsResource({ resource: 'transaction', ownerOnly: true })
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionRequestDto,
  ) {
    const updated = await this.updateTransactionUseCase.execute(
      id,
      updateDto.toCoreDto(),
    );

    if (updated.paymentMethodId) {
      await this.recalculateBalanceUseCase.execute(updated.paymentMethodId);
    }

    return TransactionResponseDto.fromEntity(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @OwnsResource({ resource: 'transaction', ownerOnly: true })
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string) {
    const transaction = await this.getTransactionByIdUseCase.execute(id);
    await this.deleteTransactionUseCase.execute(id);

    if (transaction.paymentMethodId) {
      await this.recalculateBalanceUseCase.execute(transaction.paymentMethodId);
    }
  }
}
