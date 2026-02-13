import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StoreService } from '../../core/application/services/store.service';
import { StoreResponseDto } from '../dto/store-response.dto';
import { QueryStoreDto } from '../dto/query-store.dto';
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';
import { CreateStoreDto } from '~feature/store/core';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  async create(
    @Body() query: CreateStoreDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.storeService.createOrFind({
      name: query.name,
      location: query.location,
    }, user.id);

    return StoreResponseDto.fromEntity(result);
  }

  @Get()
  async findAll(
    @Query() query: QueryStoreDto,
    @CurrentUser() user: User,
  ) {
    const pagination = new Pagination(query.page, query.limit);

    const result = await this.storeService.findAll(
      user.id,
      { search: query.search },
      pagination,
    );

    return {
      data: StoreResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const store = await this.storeService.findById(id);
    return StoreResponseDto.fromEntity(store);
  }
}
