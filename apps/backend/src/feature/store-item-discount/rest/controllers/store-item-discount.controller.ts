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
import { StoreItemDiscountService } from '../../core/application/services/store-item-discount.service';
import { CreateStoreItemDiscountRequestDto } from '../dto/create-store-item-discount-request.dto';
import { UpdateStoreItemDiscountRequestDto } from '../dto/update-store-item-discount-request.dto';
import { StoreItemDiscountResponseDto } from '../dto/store-item-discount-response.dto';
import { CreateStoreItemDiscountDto } from '../../core/application/dto/create-store-item-discount.dto';
import { UpdateStoreItemDiscountDto } from '../../core/application/dto/update-store-item-discount.dto';
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';

export class PaginatedStoreItemDiscountResponseDto {
  @ApiProperty({ type: () => [StoreItemDiscountResponseDto] })
  data: StoreItemDiscountResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

@ApiTags('Store Item Discount')
@ApiBearerAuth('bearer')
@Controller('store-items/:storeItemId/discounts')
export class StoreItemDiscountController {
  constructor(
    private readonly storeItemDiscountService: StoreItemDiscountService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a discount for a store item' })
  @ApiResponse({ status: 201, type: StoreItemDiscountResponseDto })
  async create(
    @Param('storeItemId') storeItemId: string,
    @Body() createDto: CreateStoreItemDiscountRequestDto,
  ) {
    const coreDto = new CreateStoreItemDiscountDto(
      storeItemId,
      createDto.discount,
      createDto.startedAt ? new Date(createDto.startedAt) : undefined,
    );

    const discount = await this.storeItemDiscountService.create(coreDto);
    return StoreItemDiscountResponseDto.fromEntity(discount);
  }

  @Get()
  @ApiOperation({ summary: 'List discounts for a store item with pagination' })
  @ApiResponse({ status: 200, type: PaginatedStoreItemDiscountResponseDto })
  async findAll(
    @Param('storeItemId') storeItemId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pagination = new Pagination(page, limit);

    const result =
      await this.storeItemDiscountService.findByStoreItemId(
        storeItemId,
        pagination,
      );

    return {
      data: StoreItemDiscountResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the active discount for a store item' })
  @ApiResponse({ status: 200, type: StoreItemDiscountResponseDto })
  async getActive(@Param('storeItemId') storeItemId: string) {
    const discount =
      await this.storeItemDiscountService.findActive(storeItemId);
    return discount ? StoreItemDiscountResponseDto.fromEntity(discount) : null;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store item discount by ID' })
  @ApiResponse({ status: 200, type: StoreItemDiscountResponseDto })
  async findOne(@Param('storeItemId') _storeItemId: string, @Param('id') id: string) {
    const discount = await this.storeItemDiscountService.findById(id);
    return StoreItemDiscountResponseDto.fromEntity(discount);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a store item discount' })
  @ApiResponse({ status: 200, type: StoreItemDiscountResponseDto })
  async update(
    @Param('storeItemId') _storeItemId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateStoreItemDiscountRequestDto,
  ) {
    const coreDto = new UpdateStoreItemDiscountDto(
      updateDto.discount,
      updateDto.endedAt ? new Date(updateDto.endedAt) : undefined,
    );

    const discount = await this.storeItemDiscountService.update(id, coreDto);
    return StoreItemDiscountResponseDto.fromEntity(discount);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End a store item discount' })
  @ApiResponse({ status: 200, type: StoreItemDiscountResponseDto })
  async end(@Param('storeItemId') _storeItemId: string, @Param('id') id: string) {
    const discount = await this.storeItemDiscountService.end(id);
    return StoreItemDiscountResponseDto.fromEntity(discount);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store item discount' })
  @ApiResponse({ status: 204 })
  async delete(@Param('storeItemId') _storeItemId: string, @Param('id') id: string) {
    await this.storeItemDiscountService.delete(id);
  }
}
