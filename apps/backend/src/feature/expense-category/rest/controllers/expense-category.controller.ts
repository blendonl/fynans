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
} from '@nestjs/swagger';
import { ExpenseCategoryService } from '../../core/application/services/expense-category.service';
import { CreateExpenseCategoryRequestDto } from '../dto/create-expense-category-request.dto';
import { UpdateExpenseCategoryRequestDto } from '../dto/update-expense-category-request.dto';
import { ExpenseCategoryResponseDto } from '../dto/expense-category-response.dto';
import { CreateExpenseCategoryDto } from '../../core/application/dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from '../../core/application/dto/update-expense-category.dto';
import { Pagination } from '~common/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { PaginatedExpenseCategoryResponseDto } from '../dto/paginated-expense-category-response.dto';
import { ExpenseCategoryTreeNodeDto } from '../dto/expense-category-tree-node.dto';

@ApiTags('Expense Category')
@ApiBearerAuth('bearer')
@Controller('expense-categories')
export class ExpenseCategoryController {
  constructor(
    private readonly expenseCategoryService: ExpenseCategoryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an expense category' })
  @ApiResponse({ status: 201, type: ExpenseCategoryResponseDto })
  async create(
    @Body() createDto: CreateExpenseCategoryRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreateExpenseCategoryDto(
      createDto.name,
      createDto.isConnectedToStore,
      createDto.parentId,
    );

    const category = await this.expenseCategoryService.create(coreDto, user.id);
    return ExpenseCategoryResponseDto.fromEntity(category);
  }

  @Get()
  @ApiOperation({ summary: 'List expense categories with pagination' })
  @ApiResponse({ status: 200, type: PaginatedExpenseCategoryResponseDto })
  async findAll(
    @CurrentUser() user: User,
    @Query('parentId') parentId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pagination = new Pagination(page, limit);

    const result = await this.expenseCategoryService.findAll(
      user.id,
      parentId,
      pagination,
      { search },
    );

    return {
      data: ExpenseCategoryResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get expense category tree' })
  @ApiResponse({ status: 200, type: [ExpenseCategoryTreeNodeDto] })
  async getTree(@CurrentUser() user: User) {
    const tree = await this.expenseCategoryService.getTree(user.id);

    const transformTree = (node: any) => ({
      category: ExpenseCategoryResponseDto.fromEntity(node.category),
      children: node.children.map(transformTree),
    });

    return tree.map(transformTree);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense category by ID' })
  @ApiResponse({ status: 200, type: ExpenseCategoryResponseDto })
  async findOne(@Param('id') id: string) {
    const category = await this.expenseCategoryService.findById(id);
    return ExpenseCategoryResponseDto.fromEntity(category);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense category' })
  @ApiResponse({ status: 200, type: ExpenseCategoryResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExpenseCategoryRequestDto,
  ) {
    const coreDto = new UpdateExpenseCategoryDto({
      name: updateDto.name,
      parentId: updateDto.parentId,
      isConnectedToStore: updateDto.isConnectedToStore,
    });

    const category = await this.expenseCategoryService.update(id, coreDto);
    return ExpenseCategoryResponseDto.fromEntity(category);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense category' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string) {
    await this.expenseCategoryService.delete(id);
  }
}
