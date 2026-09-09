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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateExpenseUseCase } from '../../core/application/use-cases/create-expense.use-case';
import { GetExpenseByIdUseCase } from '../../core/application/use-cases/get-expense-by-id.use-case';
import { ListExpensesUseCase } from '../../core/application/use-cases/list-expenses.use-case';
import { UpdateExpenseUseCase } from '../../core/application/use-cases/update-expense.use-case';
import { DeleteExpenseUseCase } from '../../core/application/use-cases/delete-expense.use-case';
import { GetExpenseStatisticsUseCase } from '../../core/application/use-cases/get-expense-statistics.use-case';
import { GetExpenseTrendsUseCase } from '../../core/application/use-cases/get-expense-trends.use-case';
import { ApprovePendingExpenseUseCase } from '../../core/application/use-cases/approve-pending-expense.use-case';
import { RejectPendingExpenseUseCase } from '../../core/application/use-cases/reject-pending-expense.use-case';
import { ResubmitRejectedExpenseUseCase } from '../../core/application/use-cases/resubmit-rejected-expense.use-case';
import { UpdatePendingExpenseUseCase } from '../../core/application/use-cases/update-pending-expense.use-case';
import { CreateExpenseRequestDto } from '../dto/create-expense-request.dto';
import { UpdateExpenseRequestDto } from '../dto/update-expense-request.dto';
import { RejectExpenseRequestDto } from '../dto/reject-expense-request.dto';
import { ResubmitExpenseRequestDto } from '../dto/resubmit-expense-request.dto';
import { UpdatePendingExpenseRequestDto } from '../dto/update-pending-expense-request.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { ExpenseResponseDto } from '../dto/expense-response.dto';
import { ExpenseFilters } from '../../core/application/dto/expense-filters.dto';
import { ExpenseResponseMapper } from '../mappers/expense-response.mapper';
import { BaseFilters } from '~common/dto/base-filters.dto';
import { Pagination } from '~common/dto/pagination.dto';
import {
  OwnsResource,
  RequiresFamilyMembership,
  ResourceOwnershipGuard,
} from '~common/authorization';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { QueryExpenseTrendsDto } from '../dto/query-expense-trends.dto';
import { PaginatedExpenseResponseDto } from '../dto/paginated-expense-response.dto';
import { ExpenseStatisticsResponseDto } from '../dto/expense-statistics-response.dto';
import { ExpenseTrendPointResponseDto } from '../dto/expense-trend-point-response.dto';

@ApiTags('Expense')
@ApiBearerAuth('bearer')
@UseGuards(ResourceOwnershipGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly getExpenseByIdUseCase: GetExpenseByIdUseCase,
    private readonly listExpensesUseCase: ListExpensesUseCase,
    private readonly updateExpenseUseCase: UpdateExpenseUseCase,
    private readonly deleteExpenseUseCase: DeleteExpenseUseCase,
    private readonly getExpenseStatisticsUseCase: GetExpenseStatisticsUseCase,
    private readonly getExpenseTrendsUseCase: GetExpenseTrendsUseCase,
    private readonly approvePendingExpenseUseCase: ApprovePendingExpenseUseCase,
    private readonly rejectPendingExpenseUseCase: RejectPendingExpenseUseCase,
    private readonly resubmitRejectedExpenseUseCase: ResubmitRejectedExpenseUseCase,
    private readonly updatePendingExpenseUseCase: UpdatePendingExpenseUseCase,
    private readonly expenseResponseMapper: ExpenseResponseMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiresFamilyMembership()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, type: ExpenseResponseDto })
  async create(
    @Body() createDto: CreateExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.createExpenseUseCase.execute(
      createDto.toCoreDto(user.id),
    );
    return this.expenseResponseMapper.toResponse(expense);
  }

  @Get()
  @RequiresFamilyMembership()
  @ApiOperation({ summary: 'List all expenses with pagination and filters' })
  @ApiResponse({ status: 200, type: PaginatedExpenseResponseDto })
  async findAll(@Query() query: QueryExpenseDto, @CurrentUser() user: User) {
    const filters = new ExpenseFilters({
      ...BaseFilters.fromQuery(query, user.id),
      ...(query.mine ? { userId: user.id } : {}),
      status: query.status,
    });
    const pagination = new Pagination(query.page, query.limit);

    const result = await this.listExpensesUseCase.execute(filters, pagination);

    return this.expenseResponseMapper.toPaginatedResponse(
      result,
      pagination,
      query.search,
    );
  }

  @Get('statistics')
  @RequiresFamilyMembership()
  @ApiOperation({ summary: 'Get expense statistics' })
  @ApiResponse({ status: 200, type: ExpenseStatisticsResponseDto })
  async getStatistics(
    @Query() query: QueryExpenseDto,
    @CurrentUser() user: User,
  ) {
    const filters = new ExpenseFilters({
      ...BaseFilters.fromQuery(query, user.id),
      ...(query.mine ? { userId: user.id } : {}),
    });
    const statistics = await this.getExpenseStatisticsUseCase.execute(filters);
    return ExpenseStatisticsResponseDto.fromStatistics(statistics);
  }

  @Get('trends')
  @RequiresFamilyMembership()
  @ApiOperation({ summary: 'Get expense trends over time' })
  @ApiResponse({ status: 200, type: [ExpenseTrendPointResponseDto] })
  async getTrends(
    @Query() query: QueryExpenseTrendsDto,
    @CurrentUser() user: User,
  ) {
    const filters = new ExpenseFilters({
      ...BaseFilters.fromQuery(query, user.id),
      ...(query.mine ? { userId: user.id } : {}),
    });

    const points = await this.getExpenseTrendsUseCase.execute(
      user.id,
      new Date(query.dateFrom),
      new Date(query.dateTo),
      query.groupBy || 'day',
      filters,
      query.maxLabels,
    );

    return ExpenseTrendPointResponseDto.fromPoints(points);
  }

  @Get(':id')
  @OwnsResource({ resource: 'expense' })
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const expense = await this.getExpenseByIdUseCase.execute(id, user.id);
    return this.expenseResponseMapper.toResponse(expense);
  }

  @Put(':id')
  @OwnsResource({ resource: 'expense', ownerOnly: true })
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.updateExpenseUseCase.execute(
      id,
      user.id,
      updateDto.toCoreDto(),
    );
    return this.expenseResponseMapper.toResponse(expense);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @OwnsResource({ resource: 'expense' })
  @ApiOperation({ summary: 'Approve a pending expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async approve(@Param('id') id: string, @CurrentUser() user: User) {
    const expense = await this.approvePendingExpenseUseCase.execute(
      id,
      user.id,
    );
    return this.expenseResponseMapper.toResponse(expense);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @OwnsResource({ resource: 'expense' })
  @ApiOperation({ summary: 'Reject a pending expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.rejectPendingExpenseUseCase.execute(
      id,
      user.id,
      dto.rejectionReason,
    );
    return this.expenseResponseMapper.toResponse(expense);
  }

  @Post(':id/resubmit')
  @HttpCode(HttpStatus.OK)
  @OwnsResource({ resource: 'expense', ownerOnly: true })
  @ApiOperation({ summary: 'Re-submit a rejected expense for review' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async resubmit(
    @Param('id') id: string,
    @Body() dto: ResubmitExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.resubmitRejectedExpenseUseCase.execute(
      id,
      user.id,
      dto.toCoreDto(),
    );
    return this.expenseResponseMapper.toResponse(expense);
  }

  @Patch(':id/pending')
  @OwnsResource({ resource: 'expense', ownerOnly: true })
  @ApiOperation({ summary: 'Update a pending expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  async updatePending(
    @Param('id') id: string,
    @Body() dto: UpdatePendingExpenseRequestDto,
    @CurrentUser() user: User,
  ) {
    const expense = await this.updatePendingExpenseUseCase.execute(
      id,
      user.id,
      dto.toCoreDto(),
    );
    return this.expenseResponseMapper.toResponse(expense);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @OwnsResource({ resource: 'expense', ownerOnly: true })
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.deleteExpenseUseCase.execute(id, user.id);
  }
}
