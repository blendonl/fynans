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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { CreateIncomeUseCase } from '../../core/application/use-cases/create-income.use-case';
import { GetIncomeByIdUseCase } from '../../core/application/use-cases/get-income-by-id.use-case';
import { GetIncomeByTransactionIdUseCase } from '../../core/application/use-cases/get-income-by-transaction-id.use-case';
import { ListIncomesUseCase } from '../../core/application/use-cases/list-incomes.use-case';
import { UpdateIncomeUseCase } from '../../core/application/use-cases/update-income.use-case';
import { DeleteIncomeUseCase } from '../../core/application/use-cases/delete-income.use-case';
import { CreateIncomeRequestDto } from '../dto/create-income-request.dto';
import { UpdateIncomeRequestDto } from '../dto/update-income-request.dto';
import { QueryIncomeDto } from '../dto/query-income.dto';
import { IncomeResponseDto } from '../dto/income-response.dto';
import { IncomeFilters } from '../../core/application/dto/income-filters.dto';
import { BaseFilters } from '~common/dto/base-filters.dto';
import { Pagination } from '~common/dto/pagination.dto';
import {
  OwnsResource,
  RequiresFamilyMembership,
  ResourceOwnershipGuard,
} from '~common/authorization';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

export class PaginatedIncomeResponseDto {
  @ApiProperty({ type: () => [IncomeResponseDto] })
  data: IncomeResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

@ApiTags('Income')
@ApiBearerAuth('bearer')
@UseGuards(ResourceOwnershipGuard)
@Controller('incomes')
export class IncomeController {
  constructor(
    private readonly createIncomeUseCase: CreateIncomeUseCase,
    private readonly getIncomeByIdUseCase: GetIncomeByIdUseCase,
    private readonly getIncomeByTransactionIdUseCase: GetIncomeByTransactionIdUseCase,
    private readonly listIncomesUseCase: ListIncomesUseCase,
    private readonly updateIncomeUseCase: UpdateIncomeUseCase,
    private readonly deleteIncomeUseCase: DeleteIncomeUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new income' })
  @ApiResponse({ status: 201, type: IncomeResponseDto })
  async create(
    @Body() createDto: CreateIncomeRequestDto,
    @CurrentUser() user: User,
  ) {
    const income = await this.createIncomeUseCase.execute(
      createDto.toCoreDto(user.id),
    );
    return IncomeResponseDto.fromEntity(income);
  }

  @Get()
  @RequiresFamilyMembership()
  @ApiOperation({ summary: 'List all incomes with pagination and filters' })
  @ApiResponse({ status: 200, type: PaginatedIncomeResponseDto })
  async findAll(@Query() query: QueryIncomeDto, @CurrentUser() user: User) {
    const filters = new IncomeFilters({
      ...BaseFilters.fromQuery(query, user.id),
      status: query.status,
    });
    const pagination = new Pagination(query.page, query.limit);

    const result = await this.listIncomesUseCase.execute(filters, pagination);

    return {
      data: IncomeResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('transaction/:transactionId')
  @OwnsResource({ resource: 'transaction', key: 'transactionId' })
  @ApiOperation({ summary: 'Get an income by transaction ID' })
  @ApiResponse({ status: 200, type: IncomeResponseDto })
  async findByTransactionId(@Param('transactionId') transactionId: string) {
    const income =
      await this.getIncomeByTransactionIdUseCase.execute(transactionId);
    return IncomeResponseDto.fromEntity(income);
  }

  @Get(':id')
  @OwnsResource({ resource: 'income' })
  @ApiOperation({ summary: 'Get an income by ID' })
  @ApiResponse({ status: 200, type: IncomeResponseDto })
  async findOne(@Param('id') id: string) {
    const income = await this.getIncomeByIdUseCase.execute(id);
    return IncomeResponseDto.fromEntity(income);
  }

  @Put(':id')
  @OwnsResource({ resource: 'income' })
  @ApiOperation({ summary: 'Update an income' })
  @ApiResponse({ status: 200, type: IncomeResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateIncomeRequestDto,
  ) {
    const updated = await this.updateIncomeUseCase.execute(
      id,
      updateDto.toCoreDto(),
    );
    return IncomeResponseDto.fromEntity(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @OwnsResource({ resource: 'income' })
  @ApiOperation({ summary: 'Delete an income' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string) {
    await this.deleteIncomeUseCase.execute(id);
  }
}
