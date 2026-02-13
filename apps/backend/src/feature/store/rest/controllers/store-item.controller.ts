import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoreItemService } from '../../core/application/services/store-item.service';
import { QueryStoreItemDto } from '../dto/query-store-item.dto';
import { StoreItemResponseDto } from '../dto/store-item-response.dto';
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('stores/:id/items')
export class StoreItemController {
  constructor(private readonly storeItemService: StoreItemService) {}

  @Get()
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
