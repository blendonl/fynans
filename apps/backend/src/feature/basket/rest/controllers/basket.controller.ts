import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { BasketService } from '../../core/application/services/basket.service';
import { AddBasketItemRequestDto } from '../dto/add-basket-item-request.dto';
import { UpdateBasketItemRequestDto } from '../dto/update-basket-item-request.dto';
import { CheckoutBasketRequestDto } from '../dto/checkout-basket-request.dto';
import { BasketResponseDto, BasketItemResponseDto } from '../dto/basket-response.dto';
import { AddBasketItemDto } from '../../core/application/dto/add-basket-item.dto';
import { UpdateBasketItemDto } from '../../core/application/dto/update-basket-item.dto';
import { CheckoutBasketItemsDto } from '../../core/application/dto/checkout-basket-items.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

export class CheckoutBasketResponseDto {
  @ApiProperty()
  expenseId: string;
}

@ApiTags('Basket')
@ApiBearerAuth('bearer')
@Controller('baskets')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Get()
  @ApiOperation({ summary: 'List all baskets for the current user' })
  @ApiResponse({ status: 200, type: [BasketResponseDto] })
  async listBaskets(@CurrentUser() user: User) {
    const baskets = await this.basketService.listBaskets(user.id);
    return baskets.map(BasketResponseDto.fromEntity);
  }

  @Post(':basketId/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an item to a basket' })
  @ApiResponse({ status: 201, type: BasketItemResponseDto })
  async addItem(
    @Param('basketId') basketId: string,
    @Body() body: AddBasketItemRequestDto,
    @CurrentUser() user: User,
  ) {
    const dto = new AddBasketItemDto({
      basketId,
      name: body.name,
      quantity: body.quantity,
      price: body.price,
      categoryId: body.categoryId,
      notes: body.notes,
      addedBy: user.id,
    });

    const item = await this.basketService.addItem(dto);
    return BasketItemResponseDto.fromEntity(item);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update a basket item' })
  @ApiResponse({ status: 200, type: BasketItemResponseDto })
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() body: UpdateBasketItemRequestDto,
    @CurrentUser() user: User,
  ) {
    const dto = new UpdateBasketItemDto({
      name: body.name,
      quantity: body.quantity,
      price: body.price,
      categoryId: body.categoryId,
      notes: body.notes,
    });

    const item = await this.basketService.updateItem(itemId, dto, user.id);
    return BasketItemResponseDto.fromEntity(item);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an item from a basket' })
  @ApiResponse({ status: 204 })
  async removeItem(
    @Param('itemId') itemId: string,
    @CurrentUser() user: User,
  ) {
    await this.basketService.removeItem(itemId, user.id);
  }

  @Post(':basketId/checkout')
  @ApiOperation({ summary: 'Checkout basket items into an expense' })
  @ApiResponse({ status: 201, type: CheckoutBasketResponseDto })
  async checkout(
    @Param('basketId') basketId: string,
    @Body() body: CheckoutBasketRequestDto,
    @CurrentUser() user: User,
  ) {
    const dto = new CheckoutBasketItemsDto({
      basketId,
      itemIds: body.itemIds,
      categoryId: body.categoryId,
      storeId: body.storeId,
      itemOverrides: body.itemOverrides,
      userId: user.id,
      recordedAt: body.recordedAt ? new Date(body.recordedAt) : undefined,
    });

    return this.basketService.checkout(dto);
  }
}
