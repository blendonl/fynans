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
import { ExpenseService } from '../../core/application/services/expense.service';
import { CreateExpenseRequestDto } from '../dto/create-expense-request.dto';
import { UpdateExpenseRequestDto } from '../dto/update-expense-request.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { ExpenseResponseDto } from '../dto/expense-response.dto';
import { ExpenseFilters } from '../../core/application/dto/expense-filters.dto';
import { BaseFilters } from '~common/dto/base-filters.dto';
import { Pagination } from '~common/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { QueryExpenseTrendsDto } from '../dto/query-expense-trends.dto';

export class PaginatedExpenseResponseDto {
  @ApiProperty({ type: () => [ExpenseResponseDto] })
  data: ExpenseResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class ExpenseByCategoryDto {
  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  total: number;
}

export class ExpenseByStoreDto {
  @ApiProperty()
  storeId: string;

  @ApiProperty()
  total: number;
}

export class ExpenseStatisticsResponseDto {
  @ApiProperty()
  totalExpenses: number;

  @ApiProperty()
  expenseCount: number;

  @ApiProperty()
  averageExpense: number;

  @ApiProperty({ type: () => [ExpenseByCategoryDto] })
  expensesByCategory: ExpenseByCategoryDto[];

  @ApiProperty({ type: () => [ExpenseByStoreDto] })
  expensesByStore: ExpenseByStoreDto[];
}

export class ExpenseTrendPointResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  showLabel: boolean;
}

@ApiTags('Expense')
@ApiBearerAuth('bearer')
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, type: ExpenseResponseDto })
  async create(
    @Body() createDto: CreateExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.expenseService.create(createDto.toCoreDto(user.id));
    return ExpenseResponseDto.fromEntity(expense);
  }

  @Get()
  @ApiOperation({ summary: 'List all expenses with pagination and filters' })
  @ApiResponse({ status: 200, type: PaginatedExpenseResponseDto })
  async findAll(@Query() query: QueryExpenseDto, @CurrentUser() user: User) {
    const filters = new ExpenseFilters(BaseFilters.fromQuery(query, user.id));
    const pagination = new Pagination(query.page, query.limit);

    const result = await this.expenseService.findAll(
      user.id,
      filters,
      pagination,
    );

    const data = result.data.map((expense) => {
      const dto = ExpenseResponseDto.fromEntity(expense);
      if (query.search && dto.items?.length) {
        const searchLower = query.search.toLowerCase();
        dto.matchedItems = dto.items.filter(
          (item) => item.name.toLowerCase().includes(searchLower),
        );
      }
      return dto;
    });

    return {
      data,
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get expense statistics' })
  @ApiResponse({ status: 200, type: ExpenseStatisticsResponseDto })
  async getStatistics(
    @Query() query: QueryExpenseDto,
    @CurrentUser() user: User,
  ) {
    const filters = new ExpenseFilters(BaseFilters.fromQuery(query, user.id));
    return this.expenseService.getStatistics(user.id, filters);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get expense trends over time' })
  @ApiResponse({ status: 200, type: [ExpenseTrendPointResponseDto] })
  async getTrends(
    @Query() query: QueryExpenseTrendsDto,
    @CurrentUser() user: User,
  ) {
    const filters = new ExpenseFilters(BaseFilters.fromQuery(query, user.id));

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
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const expense = await this.expenseService.findById(id, user.id);
    return ExpenseResponseDto.fromEntity(expense);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.expenseService.update(id, user.id, updateDto.toCoreDto());
    return ExpenseResponseDto.fromEntity(expense);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.expenseService.delete(id, user.id);
  }
}
