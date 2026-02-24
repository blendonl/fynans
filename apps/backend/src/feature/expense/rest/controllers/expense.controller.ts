import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
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
import { RejectExpenseRequestDto } from '../dto/reject-expense-request.dto';
import { ResubmitExpenseRequestDto } from '../dto/resubmit-expense-request.dto';
import { UpdatePendingExpenseRequestDto } from '../dto/update-pending-expense-request.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { ExpenseResponseDto } from '../dto/expense-response.dto';
import { ExpenseFilters } from '../../core/application/dto/expense-filters.dto';
import { Expense } from '../../core/domain/entities/expense.entity';
import { IStorageProvider } from '~common/storage/storage-provider.interface';
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
  constructor(
    private readonly expenseService: ExpenseService,
    @Inject('StorageProvider') private readonly storage: IStorageProvider,
  ) {}

  private async withReceiptUrl(dto: ExpenseResponseDto, expense: Expense): Promise<ExpenseResponseDto> {
    if (expense.receipt) {
      try {
        const url = await this.storage.getPresignedDownloadUrl(expense.receipt.storageKey);
        dto.receiptImages = [url];
      } catch {
        // Storage unavailable — leave empty
      }
    }
    return dto;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, type: ExpenseResponseDto })
  async create(
    @Body() createDto: CreateExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.expenseService.create(createDto.toCoreDto(user.id));
    return this.withReceiptUrl(ExpenseResponseDto.fromEntity(expense), expense);
  }

  @Get()
  @ApiOperation({ summary: 'List all expenses with pagination and filters' })
  @ApiResponse({ status: 200, type: PaginatedExpenseResponseDto })
  async findAll(@Query() query: QueryExpenseDto, @CurrentUser() user: User) {
    const filters = new ExpenseFilters({
      ...BaseFilters.fromQuery(query, user.id),
      status: query.status,
    });
    const pagination = new Pagination(query.page, query.limit);

    const result = await this.expenseService.findAll(
      user.id,
      filters,
      pagination,
    );

    const data = await Promise.all(
      result.data.map(async (expense) => {
        const dto = ExpenseResponseDto.fromEntity(expense);
        await this.withReceiptUrl(dto, expense);
        if (query.search && dto.items?.length) {
          const searchLower = query.search.toLowerCase();
          dto.matchedItems = dto.items.filter(
            (item) => item.name.toLowerCase().includes(searchLower),
          );
        }
        return dto;
      }),
    );

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
    return this.withReceiptUrl(ExpenseResponseDto.fromEntity(expense), expense);
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
    return this.withReceiptUrl(ExpenseResponseDto.fromEntity(expense), expense);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async approve(@Param('id') id: string, @CurrentUser() user: User) {
    const expense = await this.expenseService.approvePending(id, user.id);
    return this.withReceiptUrl(ExpenseResponseDto.fromEntity(expense), expense);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a pending expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.expenseService.rejectPending(
      id,
      user.id,
      dto.rejectionReason,
    );
    return this.withReceiptUrl(ExpenseResponseDto.fromEntity(expense), expense);
  }

  @Post(':id/resubmit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-submit a rejected expense for review' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async resubmit(
    @Param('id') id: string,
    @Body() dto: ResubmitExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.expenseService.resubmitRejected(
      id,
      user.id,
      dto.toCoreDto(),
    );
    return this.withReceiptUrl(ExpenseResponseDto.fromEntity(expense), expense);
  }

  @Patch(':id/pending')
  @ApiOperation({ summary: 'Update a pending expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async updatePending(
    @Param('id') id: string,
    @Body() dto: UpdatePendingExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.expenseService.updatePending(
      id,
      user.id,
      dto.toCoreDto(),
    );
    return this.withReceiptUrl(ExpenseResponseDto.fromEntity(expense), expense);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.expenseService.delete(id, user.id);
  }
}
