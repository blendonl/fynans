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
import { IncomeCategoryService } from '../../core/application/services/income-category.service';
import { CreateIncomeCategoryRequestDto } from '../dto/create-income-category-request.dto';
import { UpdateIncomeCategoryRequestDto } from '../dto/update-income-category-request.dto';
import { IncomeCategoryResponseDto } from '../dto/income-category-response.dto';
import { CreateIncomeCategoryDto } from '../../core/application/dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from '../../core/application/dto/update-income-category.dto';
import { Pagination } from '../../../transaction/core/application/dto/pagination.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('income-categories')
export class IncomeCategoryController {
  constructor(
    private readonly incomeCategoryService: IncomeCategoryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateIncomeCategoryRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreateIncomeCategoryDto(
      createDto.name,
      createDto.parentId,
    );

    const category = await this.incomeCategoryService.create(coreDto, user.id);
    return IncomeCategoryResponseDto.fromEntity(category);
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('parentId') parentId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pagination = new Pagination(page, limit);

    const result = await this.incomeCategoryService.findAll(
      user.id,
      parentId,
      pagination,
    );

    return {
      data: IncomeCategoryResponseDto.fromEntities(result.data),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Get('tree')
  async getTree(@CurrentUser() user: User) {
    const tree = await this.incomeCategoryService.getTree(user.id);

    const transformTree = (node: any) => ({
      category: IncomeCategoryResponseDto.fromEntity(node.category),
      children: node.children.map(transformTree),
    });

    return tree.map(transformTree);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.incomeCategoryService.findById(id);
    return IncomeCategoryResponseDto.fromEntity(category);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateIncomeCategoryRequestDto,
  ) {
    const coreDto = new UpdateIncomeCategoryDto({
      name: updateDto.name,
      parentId: updateDto.parentId,
    });

    const category = await this.incomeCategoryService.update(id, coreDto);
    return IncomeCategoryResponseDto.fromEntity(category);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.incomeCategoryService.delete(id);
  }
}
