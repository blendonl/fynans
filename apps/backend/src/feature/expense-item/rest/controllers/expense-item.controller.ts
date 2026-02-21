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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExpenseItemService } from '../../core/application/services/expense-item.service';
import { CreateExpenseItemRequestDto } from '../dto/create-expense-item-request.dto';
import { UpdateExpenseItemRequestDto } from '../dto/update-expense-item-request.dto';
import {
  ExpenseItemResponseDto,
  PaginatedExpenseItemResponseDto,
} from '../dto/expense-item-response.dto';
import { CreateExpenseItemDto } from '../../core/application/dto/create-expense-item.dto';
import { UpdateExpenseItemDto } from '../../core/application/dto/update-expense-item.dto';
import { Pagination } from '~common/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@ApiTags('Expense Items')
@ApiBearerAuth('bearer')
@Controller('expense-items')
export class ExpenseItemController {
  constructor(private readonly expenseItemService: ExpenseItemService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new expense item' })
  @ApiResponse({ status: 201, type: ExpenseItemResponseDto })
  async create(
    @Body() createDto: CreateExpenseItemRequestDto,
    @CurrentUser() user: User,
    @Query('storeId') storeId?: string,
  ) {
    if (!storeId) {
      throw new BadRequestException('Store ID is required');
    }

    const coreDto = new CreateExpenseItemDto({
      expenseId: createDto.expenseId,
      categoryId: createDto.categoryId,
      itemName: createDto.itemName,
      itemPrice: createDto.itemPrice,
      discount: createDto.discount,
      itemId: createDto.itemId,
      sizeValue: createDto.sizeValue,
      sizeUnit: createDto.sizeUnit,
    });

    const item = await this.expenseItemService.create(coreDto, storeId, user.id);
    return ExpenseItemResponseDto.fromEntity(item);
  }

  @Get()
  @ApiOperation({ summary: 'List expense items with pagination' })
  @ApiResponse({ status: 200, type: PaginatedExpenseItemResponseDto })
  async findAll(
    @Query('expenseId') expenseId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pagination = new Pagination(page, limit);

    const result = await this.expenseItemService.findAll(
      expenseId,
      pagination,
    );

    return {
      data: ExpenseItemResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense item by ID' })
  @ApiResponse({ status: 200, type: ExpenseItemResponseDto })
  async findOne(@Param('id') id: string) {
    const item = await this.expenseItemService.findById(id);
    return ExpenseItemResponseDto.fromEntity(item);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense item' })
  @ApiResponse({ status: 200, type: ExpenseItemResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExpenseItemRequestDto,
  ) {
    const coreDto = new UpdateExpenseItemDto({
      categoryId: updateDto.categoryId,
      price: updateDto.price,
      discount: updateDto.discount,
    });

    const item = await this.expenseItemService.update(id, coreDto);
    return ExpenseItemResponseDto.fromEntity(item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense item' })
  @ApiResponse({ status: 204, description: 'Expense item deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.expenseItemService.delete(id);
  }
}
