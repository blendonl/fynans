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
import { StoreItemDiscountService } from '../../core/application/services/store-item-discount.service';
import { CreateStoreItemDiscountRequestDto } from '../dto/create-store-item-discount-request.dto';
import { UpdateStoreItemDiscountRequestDto } from '../dto/update-store-item-discount-request.dto';
import { StoreItemDiscountResponseDto } from '../dto/store-item-discount-response.dto';
import { CreateStoreItemDiscountDto } from '../../core/application/dto/create-store-item-discount.dto';
import { UpdateStoreItemDiscountDto } from '../../core/application/dto/update-store-item-discount.dto';
import { Pagination } from '~common/dto/pagination.dto';

@Controller('store-items/:storeItemId/discounts')
export class StoreItemDiscountController {
  constructor(
    private readonly storeItemDiscountService: StoreItemDiscountService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  async getActive(@Param('storeItemId') storeItemId: string) {
    const discount =
      await this.storeItemDiscountService.findActive(storeItemId);
    return discount ? StoreItemDiscountResponseDto.fromEntity(discount) : null;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const discount = await this.storeItemDiscountService.findById(id);
    return StoreItemDiscountResponseDto.fromEntity(discount);
  }

  @Put(':id')
  async update(
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
  async end(@Param('id') id: string) {
    const discount = await this.storeItemDiscountService.end(id);
    return StoreItemDiscountResponseDto.fromEntity(discount);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.storeItemDiscountService.delete(id);
  }
}
