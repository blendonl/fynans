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
import { StoreItemCategoryService } from '../../core/application/services/store-item-category.service';
import { CreateStoreItemCategoryRequestDto } from '../dto/create-store-item-category-request.dto';
import { UpdateStoreItemCategoryRequestDto } from '../dto/update-store-item-category-request.dto';
import { StoreItemCategoryResponseDto } from '../dto/store-item-category-response.dto';
import { CreateStoreItemCategoryDto } from '../../core/application/dto/create-store-item-category.dto';
import { UpdateStoreItemCategoryDto } from '../../core/application/dto/update-store-item-category.dto';
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

export class StoreItemCategoryTreeNodeDto {
  @ApiProperty({ type: () => StoreItemCategoryResponseDto })
  category: StoreItemCategoryResponseDto;

  @ApiProperty({ type: () => [StoreItemCategoryTreeNodeDto] })
  children: StoreItemCategoryTreeNodeDto[];
}

export class PaginatedStoreItemCategoryResponseDto {
  @ApiProperty({ type: () => [StoreItemCategoryResponseDto] })
  data: StoreItemCategoryResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

@ApiTags('Store Item Category')
@ApiBearerAuth('bearer')
@Controller('expense-item-categories')
export class StoreItemCategoryController {
  constructor(
    private readonly storeItemCategoryService: StoreItemCategoryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a store item category' })
  @ApiResponse({ status: 201, type: StoreItemCategoryResponseDto })
  async create(
    @Body() createDto: CreateStoreItemCategoryRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreateStoreItemCategoryDto(
      createDto.name,
      createDto.parentId,
    );

    const category = await this.storeItemCategoryService.create(coreDto, user.id);
    return StoreItemCategoryResponseDto.fromEntity(category);
  }

  @Get()
  @ApiOperation({ summary: 'List store item categories with pagination' })
  @ApiResponse({ status: 200, type: PaginatedStoreItemCategoryResponseDto })
  async findAll(
    @CurrentUser() user: User,
    @Query('parentId') parentId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pagination = new Pagination(page, limit);

    const result = await this.storeItemCategoryService.findAll(
      user.id,
      parentId,
      pagination,
    );

    return {
      data: StoreItemCategoryResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get store item category tree' })
  @ApiResponse({ status: 200, type: [StoreItemCategoryTreeNodeDto] })
  async getTree(@CurrentUser() user: User) {
    const tree = await this.storeItemCategoryService.getTree(user.id);

    const transformTree = (node: any) => ({
      category: StoreItemCategoryResponseDto.fromEntity(node.category),
      children: node.children.map(transformTree),
    });

    return tree.map(transformTree);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store item category by ID' })
  @ApiResponse({ status: 200, type: StoreItemCategoryResponseDto })
  async findOne(@Param('id') id: string) {
    const category = await this.storeItemCategoryService.findById(id);
    return StoreItemCategoryResponseDto.fromEntity(category);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a store item category' })
  @ApiResponse({ status: 200, type: StoreItemCategoryResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStoreItemCategoryRequestDto,
  ) {
    const coreDto = new UpdateStoreItemCategoryDto({
      name: updateDto.name,
      parentId: updateDto.parentId,
    });

    const category = await this.storeItemCategoryService.update(id, coreDto);
    return StoreItemCategoryResponseDto.fromEntity(category);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store item category' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string) {
    await this.storeItemCategoryService.delete(id);
  }
}
