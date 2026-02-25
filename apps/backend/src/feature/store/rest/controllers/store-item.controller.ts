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
import { StoreItemService } from '../../core/application/services/store-item.service';
import { QueryStoreItemDto } from '../dto/query-store-item.dto';
import { StoreItemResponseDto } from '../dto/store-item-response.dto';
import { CreateStoreItemRequestDto } from '../dto/create-store-item-request.dto';
import { UpdateStoreItemRequestDto } from '../dto/update-store-item-request.dto';
import { CreateStoreItemDto } from '../../core/application/dto/create-store-item.dto';
import { UpdateStoreItemDto } from '../../core/application/dto/update-store-item.dto';
import { Pagination } from '~common/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

export class PaginatedStoreItemResponseDto {
  @ApiProperty({ type: [StoreItemResponseDto] })
  data: StoreItemResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

@ApiTags('Store Item')
@ApiBearerAuth('bearer')
@Controller('store-items')
export class StoreItemController {
  constructor(private readonly storeItemService: StoreItemService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a store item link' })
  @ApiResponse({ status: 201, type: StoreItemResponseDto })
  async create(
    @Body() dto: CreateStoreItemRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreateStoreItemDto(
      dto.storeId,
      dto.name,
      dto.price,
      dto.categoryId,
      dto.isDiscounted,
    );
    const item = await this.storeItemService.createOrFind(coreDto, user.id);
    return StoreItemResponseDto.fromEntity(item);
  }

  @Get()
  @ApiOperation({ summary: 'List store items by storeId or itemId' })
  @ApiResponse({ status: 200, type: PaginatedStoreItemResponseDto })
  async findAll(
    @Query() query: QueryStoreItemDto,
    @CurrentUser() user: User,
  ) {
    const pagination = new Pagination(query.page, query.limit);

    const result = await this.storeItemService.findAll(
      user.id,
      { storeId: query.storeId, itemId: query.itemId, search: query.search },
      pagination,
    );

    return {
      data: StoreItemResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a store item' })
  @ApiResponse({ status: 200, type: StoreItemResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreItemRequestDto,
  ) {
    const coreDto = new UpdateStoreItemDto({
      price: dto.price,
      isDiscounted: dto.isDiscounted,
    });
    const item = await this.storeItemService.update(id, coreDto);
    return StoreItemResponseDto.fromEntity(item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store item' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string) {
    await this.storeItemService.delete(id);
  }
}
