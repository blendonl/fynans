import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { StoreService } from '../../core/application/services/store.service';
import { StoreResponseDto } from '../dto/store-response.dto';
import { QueryStoreDto } from '../dto/query-store.dto';
import { Pagination } from '~common/dto/pagination.dto';
import { CreateStoreDto } from '~feature/store/core';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

export class PaginatedStoreResponseDto {
  @ApiProperty({ type: [StoreResponseDto] })
  data: StoreResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

@ApiTags('Store')
@ApiBearerAuth('bearer')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create or find a store' })
  @ApiResponse({ status: 201, type: StoreResponseDto })
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
  @ApiOperation({ summary: 'List all stores with pagination' })
  @ApiResponse({ status: 200, type: PaginatedStoreResponseDto })
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
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiResponse({ status: 200, type: StoreResponseDto })
  async findOne(@Param('id') id: string) {
    const store = await this.storeService.findById(id);
    return StoreResponseDto.fromEntity(store);
  }
}
