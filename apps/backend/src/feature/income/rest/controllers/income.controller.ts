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
import { IncomeService } from '../../core/application/services/income.service';
import { CreateIncomeRequestDto } from '../dto/create-income-request.dto';
import { UpdateIncomeRequestDto } from '../dto/update-income-request.dto';
import { QueryIncomeDto } from '../dto/query-income.dto';
import { IncomeResponseDto } from '../dto/income-response.dto';
import { IncomeFilters } from '../../core/application/dto/income-filters.dto';
import { BaseFilters } from '~common/dto/base-filters.dto';
import { Pagination } from '~common/dto/pagination.dto';
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
@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new income' })
  @ApiResponse({ status: 201, type: IncomeResponseDto })
  async create(
    @Body() createDto: CreateIncomeRequestDto,
    @CurrentUser() user: User,
  ) {
    const income = await this.incomeService.create(createDto.toCoreDto());
    return IncomeResponseDto.fromEntity(income);
  }

  @Get()
  @ApiOperation({ summary: 'List all incomes with pagination and filters' })
  @ApiResponse({ status: 200, type: PaginatedIncomeResponseDto })
  async findAll(@Query() query: QueryIncomeDto, @CurrentUser() user: User) {
    const filters = new IncomeFilters(BaseFilters.fromQuery(query, user.id));
    const pagination = new Pagination(query.page, query.limit);

    const result = await this.incomeService.findAll(
      user.id,
      filters,
      pagination,
    );

    return {
      data: IncomeResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('transaction/:transactionId')
  @ApiOperation({ summary: 'Get an income by transaction ID' })
  @ApiResponse({ status: 200, type: IncomeResponseDto })
  async findByTransactionId(
    @Param('transactionId') transactionId: string,
    @CurrentUser() user: User,
  ) {
    const income = await this.incomeService.findByTransactionId(transactionId, user.id);
    return IncomeResponseDto.fromEntity(income);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an income by ID' })
  @ApiResponse({ status: 200, type: IncomeResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const income = await this.incomeService.findById(id, user.id);
    return IncomeResponseDto.fromEntity(income);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an income' })
  @ApiResponse({ status: 200, type: IncomeResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateIncomeRequestDto,
    @CurrentUser() user: User,
  ) {
    const updated = await this.incomeService.update(id, updateDto.toCoreDto(), user.id);
    return IncomeResponseDto.fromEntity(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an income' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.incomeService.delete(id, user.id);
  }
}
