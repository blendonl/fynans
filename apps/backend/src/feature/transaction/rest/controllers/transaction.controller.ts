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
import { TransactionFilters } from '../../core/application/dto/transaction-filters.dto';
import { Pagination } from '~common/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateTransactionRequestDto,
    @CurrentUser() user: User,
  ) {
    const transaction = await this.transactionService.create(createDto.toCoreDto(user.id));
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Get()
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

    return this.transactionService.getStatistics(user.id, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const transaction = await this.transactionService.findById(id, user.id);
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionRequestDto,
    @CurrentUser() user: User,
  ) {
    const updated = await this.transactionService.update(id, updateDto.toCoreDto(), user.id);
    return TransactionResponseDto.fromEntity(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.transactionService.delete(id, user.id);
  }
}
