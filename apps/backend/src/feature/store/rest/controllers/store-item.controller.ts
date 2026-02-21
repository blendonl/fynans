import { Controller, Get, Param, Query } from '@nestjs/common';
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
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';
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
@Controller('stores/:id/items')
export class StoreItemController {
  constructor(private readonly storeItemService: StoreItemService) {}

  @Get()
  @ApiOperation({ summary: 'List store items with pagination' })
  @ApiResponse({ status: 200, type: PaginatedStoreItemResponseDto })
  async findAll(
    @Param('id') id: string,
    @Query() query: QueryStoreItemDto,
    @CurrentUser() user: User,
  ) {
    const pagination = new Pagination(query.page, query.limit);

    const result = await this.storeItemService.findAll(
      user.id,
      { storeId: id, search: query.search },
      pagination,
    );

    return {
      data: StoreItemResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }
}
