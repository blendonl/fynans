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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { TransactionService } from '../../core/application/services/transaction.service';
import { CreateTransactionRequestDto } from '../dto/create-transaction-request.dto';
import { UpdateTransactionRequestDto } from '../dto/update-transaction-request.dto';
import { QueryTransactionDto } from '../dto/query-transaction.dto';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { TransactionStatisticsComparisonResponseDto } from '../dto/transaction-statistics-comparison-response.dto';
import { TransactionFilters } from '../../core/application/dto/transaction-filters.dto';
import { Pagination } from '~common/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { PaymentMethodService } from '../../../payment-method/core/application/services/payment-method.service';

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
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async create(
    @Body() createDto: CreateTransactionRequestDto,
    @CurrentUser() user: User,
  ) {
    const transaction = await this.transactionService.create(createDto.toCoreDto(user.id));

    if (createDto.paymentMethodId) {
      await this.paymentMethodService.recalculateBalance(createDto.paymentMethodId);
    }

    return TransactionResponseDto.fromEntity(transaction);
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions with pagination and filters' })
  @ApiResponse({ status: 200, type: PaginatedTransactionResponseDto })
  async findAll(
    @Query() query: QueryTransactionDto,
    @CurrentUser() user: User,
  ) {
    const filters = new TransactionFilters({
      userId: query.familyId ? undefined : user.id,
      type: query.type,
      familyId: query.familyId,
      scope: query.scope,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
      paymentMethodId: query.paymentMethodId,
    });

    const pagination = new Pagination(query.page, query.limit);
    const result = await this.transactionService.findAll(filters, pagination);

    return {
      data: TransactionResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, type: TransactionStatisticsResponseDto })
  async getStatistics(
    @Query() query: QueryTransactionDto,
    @CurrentUser() user: User,
  ) {
    const filters = new TransactionFilters({
      userId: query.familyId ? undefined : user.id,
      type: query.type,
      familyId: query.familyId,
      scope: query.scope,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
      paymentMethodId: query.paymentMethodId,
    });

    return this.transactionService.getStatistics(user.id, filters);
  }

  @Get('statistics/comparison')
  @ApiOperation({ summary: 'Get transaction statistics with period comparison' })
  @ApiResponse({ status: 200, type: TransactionStatisticsComparisonResponseDto })
  async getStatisticsComparison(
    @Query() query: QueryTransactionDto,
    @CurrentUser() user: User,
  ) {
    const filters = new TransactionFilters({
      userId: query.familyId ? undefined : user.id,
      type: query.type,
      familyId: query.familyId,
      scope: query.scope,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
      paymentMethodId: query.paymentMethodId,
    });

    return this.transactionService.getStatisticsComparison(user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const transaction = await this.transactionService.findById(id, user.id);
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionRequestDto,
    @CurrentUser() user: User,
  ) {
    const updated = await this.transactionService.update(id, updateDto.toCoreDto(), user.id);

    if (updated.paymentMethodId) {
      await this.paymentMethodService.recalculateBalance(updated.paymentMethodId);
    }

    return TransactionResponseDto.fromEntity(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const transaction = await this.transactionService.findById(id, user.id);
    await this.transactionService.delete(id, user.id);

    if (transaction.paymentMethodId) {
      await this.paymentMethodService.recalculateBalance(transaction.paymentMethodId);
    }
  }
}
