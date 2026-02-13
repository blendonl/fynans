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
import { IncomeService } from '../../core/application/services/income.service';
import { CreateIncomeRequestDto } from '../dto/create-income-request.dto';
import { UpdateIncomeRequestDto } from '../dto/update-income-request.dto';
import { QueryIncomeDto } from '../dto/query-income.dto';
import { IncomeResponseDto } from '../dto/income-response.dto';
import { CreateIncomeDto } from '../../core/application/dto/create-income.dto';
import { UpdateIncomeDto } from '../../core/application/dto/update-income.dto';
import { IncomeFilters } from '../../core/application/dto/income-filters.dto';
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateIncomeRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreateIncomeDto(
      createDto.transactionId,
      createDto.storeId,
      createDto.categoryId,
    );

    const income = await this.incomeService.create(coreDto);
    return IncomeResponseDto.fromEntity(income);
  }

  @Get()
  async findAll(@Query() query: QueryIncomeDto, @CurrentUser() user: User) {
    const filters = new IncomeFilters({
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
  async findByTransactionId(@Param('transactionId') transactionId: string) {
    const income = await this.incomeService.findByTransactionId(transactionId);
    return IncomeResponseDto.fromEntity(income);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const income = await this.incomeService.findById(id);
    return IncomeResponseDto.fromEntity(income);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateIncomeRequestDto,
  ) {
    const coreDto = new UpdateIncomeDto({
      categoryId: updateDto.categoryId,
    });

    const income = await this.incomeService.update(id, coreDto);
    return IncomeResponseDto.fromEntity(income);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.incomeService.delete(id);
  }
}
