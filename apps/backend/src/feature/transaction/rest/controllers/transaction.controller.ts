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
  ForbiddenException,
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
import { CreateTransactionDto } from '../../core/application/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../../core/application/dto/update-transaction.dto';
import { TransactionFilters } from '../../core/application/dto/transaction-filters.dto';
import { Pagination } from '../../core/application/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

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
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async create(
    @Body() createDto: CreateTransactionRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreateTransactionDto(
      user.id,
      createDto.type,
      createDto.value,
      createDto.recordedAt ? new Date(createDto.recordedAt) : undefined,
      createDto.familyId,
    );

    const transaction = await this.transactionService.create(coreDto);
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
      userId: user.id,
      type: query.type,
      familyId: query.familyId,
      scope: query.scope,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
    });

    const stats = await this.transactionService.getStatistics(
      user.id,
      filters,
    );
    return {
      totalIncome: stats.totalIncome,
      totalExpense: stats.totalExpense,
      balance: stats.balance,
      count: stats.count,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const transaction = await this.transactionService.findById(id);
    if (transaction.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
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
    const transaction = await this.transactionService.findById(id);
    if (transaction.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    const coreDto = new UpdateTransactionDto({
      type: updateDto.type,
      value: updateDto.value,
    });

    const updated = await this.transactionService.update(id, coreDto);
    return TransactionResponseDto.fromEntity(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const transaction = await this.transactionService.findById(id);
    if (transaction.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    await this.transactionService.delete(id);
  }
}
