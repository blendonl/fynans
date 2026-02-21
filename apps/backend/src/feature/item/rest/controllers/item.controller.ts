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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ItemService } from '../../core/application/services/item.service';
import { CreateItemRequestDto } from '../dto/create-item-request.dto';
import { UpdateItemRequestDto } from '../dto/update-item-request.dto';
import {
  ItemResponseDto,
  PaginatedItemResponseDto,
  PaginatedItemWithStoresResponseDto,
} from '../dto/item-response.dto';
import { CreateItemDto } from '../../core/application/dto/create-item.dto';
import { UpdateItemDto } from '../../core/application/dto/update-item.dto';
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@ApiTags('Items')
@ApiBearerAuth('bearer')
@Controller('items')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, type: ItemResponseDto })
  async create(
    @Body() createDto: CreateItemRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreateItemDto(createDto.name, createDto.categoryId);

    const item = await this.itemService.create(coreDto, user.id);
    return ItemResponseDto.fromEntity(item);
  }

  @Get()
  @ApiOperation({ summary: 'List all items with pagination' })
  @ApiResponse({ status: 200, type: PaginatedItemResponseDto })
  async findAll(
    @CurrentUser() user: User,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pagination = new Pagination(page, limit);

    const result = await this.itemService.findAll(user.id, categoryId, { search }, pagination);

    return {
      data: ItemResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('with-stores')
  @ApiOperation({ summary: 'Search items with store price information' })
  @ApiResponse({ status: 200, type: PaginatedItemWithStoresResponseDto })
  async findWithStores(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const pagination = new Pagination(page, limit);
    const result = await this.itemService.searchWithStores(user.id, search, pagination);
    return {
      data: result.data,
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for an item by name' })
  @ApiResponse({ status: 200, type: ItemResponseDto })
  async search(@Query('name') name: string) {
    const item = await this.itemService.findByName(name);
    return item ? ItemResponseDto.fromEntity(item) : null;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item by ID' })
  @ApiResponse({ status: 200, type: ItemResponseDto })
  async findOne(@Param('id') id: string) {
    const item = await this.itemService.findById(id);
    return ItemResponseDto.fromEntity(item);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an item' })
  @ApiResponse({ status: 200, type: ItemResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateItemRequestDto,
  ) {
    const coreDto = new UpdateItemDto(updateDto.name, updateDto.categoryId);

    const item = await this.itemService.update(id, coreDto);
    return ItemResponseDto.fromEntity(item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an item' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  async delete(@Param('id') id: string) {
    await this.itemService.delete(id);
  }
}
