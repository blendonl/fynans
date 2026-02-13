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
import { ExpenseService } from '../../core/application/services/expense.service';
import { CreateExpenseRequestDto } from '../dto/create-expense-request.dto';
import { UpdateExpenseRequestDto } from '../dto/update-expense-request.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { ExpenseResponseDto } from '../dto/expense-response.dto';
import { CreateExpenseDto } from '../../core/application/dto/create-expense.dto';
import { UpdateExpenseDto } from '../../core/application/dto/update-expense.dto';
import { ExpenseFilters } from '../../core/application/dto/expense-filters.dto';
import { CreateExpenseItemDto } from '../../../expense-item/core/application/dto/create-expense-item.dto';
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { QueryExpenseTrendsDto } from '../dto/query-expense-trends.dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreateExpenseDto({
      userId: user.id,
      categoryId: createDto.categoryId,
      storeName: createDto.storeName,
      storeLocation: createDto.storeLocation,
      familyId: createDto.familyId,
      items: createDto.items.map(
        (item) =>
          new CreateExpenseItemDto({
            expenseId: '',
            categoryId: item.categoryId,
            itemName: item.itemName,
            itemPrice: item.itemPrice,
            discount: item.discount,
            quantity: item.quantity,
          }),
      ),
      recordedAt: createDto.recordedAt
        ? new Date(createDto.recordedAt)
        : undefined,
    });

    const expense = await this.expenseService.create(coreDto);

    return ExpenseResponseDto.fromEntity(expense);
  }

  @Get()
  async findAll(@Query() query: QueryExpenseDto, @CurrentUser() user: User) {
    const filters = new ExpenseFilters({
      categoryId: query.categoryId,
      userId: query.familyId ? undefined : user.id, // Only filter by userId if not filtering by family
      familyId: query.familyId,
      scope: query.scope,
      storeId: query.storeId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
    });

    const pagination = new Pagination(query.page, query.limit);

    const result = await this.expenseService.findAll(
      user.id,
      filters,
      pagination,
    );

    return {
      data: ExpenseResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('statistics')
  async getStatistics(
    @Query() query: QueryExpenseDto,
    @CurrentUser() user: User,
  ) {
    const filters = new ExpenseFilters({
      userId: query.familyId ? undefined : user.id,
      familyId: query.familyId,
      scope: query.scope,
      categoryId: query.categoryId,
      storeId: query.storeId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
    });

    const stats = await this.expenseService.getStatistics(user.id, filters);

    return {
      totalExpenses: stats.totalExpenses,
      expenseCount: stats.expenseCount,
      averageExpense: stats.averageExpense,
      expensesByCategory: stats.expensesByCategory,
      expensesByStore: stats.expensesByStore,
    };
  }

  @Get('trends')
  async getTrends(
    @Query() query: QueryExpenseTrendsDto,
    @CurrentUser() user: User,
  ) {
    const filters = new ExpenseFilters({
      userId: query.familyId ? undefined : user.id,
      familyId: query.familyId,
      scope: query.scope,
      categoryId: query.categoryId,
      storeId: query.storeId,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
    });

    return this.expenseService.getTrends(
      user.id,
      new Date(query.dateFrom),
      new Date(query.dateTo),
      query.groupBy || 'day',
      filters,
      query.maxLabels,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const expense = await this.expenseService.findById(id, user.id);
    return ExpenseResponseDto.fromEntity(expense);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new UpdateExpenseDto({
      categoryId: updateDto.categoryId,
      storeId: updateDto.storeId,
    });

    const expense = await this.expenseService.update(id, user.id, coreDto);
    return ExpenseResponseDto.fromEntity(expense);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.expenseService.delete(id, user.id);
  }
}
