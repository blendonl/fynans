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
import { ItemService } from '../../core/application/services/item.service';
import { CreateItemRequestDto } from '../dto/create-item-request.dto';
import { UpdateItemRequestDto } from '../dto/update-item-request.dto';
import { ItemResponseDto } from '../dto/item-response.dto';
import { CreateItemDto } from '../../core/application/dto/create-item.dto';
import { UpdateItemDto } from '../../core/application/dto/update-item.dto';
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateItemRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreateItemDto(createDto.name, createDto.categoryId);

    const item = await this.itemService.create(coreDto, user.id);
    return ItemResponseDto.fromEntity(item);
  }

  @Get()
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

  @Get('search')
  async search(@Query('name') name: string) {
    const item = await this.itemService.findByName(name);
    return item ? ItemResponseDto.fromEntity(item) : null;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.itemService.findById(id);
    return ItemResponseDto.fromEntity(item);
  }

  @Put(':id')
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
  async delete(@Param('id') id: string) {
    await this.itemService.delete(id);
  }
}
