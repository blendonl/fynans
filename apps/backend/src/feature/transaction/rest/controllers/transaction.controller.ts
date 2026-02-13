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

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateTransactionRequestDto) {
    const coreDto = new CreateTransactionDto(
      createDto.userId,
      createDto.type,
      createDto.value,
    );

    const transaction = await this.transactionService.create(coreDto);
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Get()
  async findAll(@Query() query: QueryTransactionDto) {
    const filters = new TransactionFilters({
      userId: query.userId,
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
  async getStatistics(
    @Query() query: QueryTransactionDto,
    @CurrentUser() user: User,
  ) {
    const filters = new TransactionFilters({
      userId: query.userId || user.id,
      type: query.type,
      familyId: query.familyId,
      scope: query.scope,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
    });

    const stats = await this.transactionService.getStatistics(
      query.userId || user.id,
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
  async findOne(@Param('id') id: string) {
    const transaction = await this.transactionService.findById(id);
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionRequestDto,
  ) {
    const coreDto = new UpdateTransactionDto({
      type: updateDto.type,
      value: updateDto.value,
    });

    const transaction = await this.transactionService.update(id, coreDto);
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.transactionService.delete(id);
  }
}
