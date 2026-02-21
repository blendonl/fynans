import { Controller, Post, Body, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { AiCategoryService } from '../../core/application/services/ai-category.service';
import { SuggestCategoryRequestDto } from '../dto/suggest-category-request.dto';
import { CurrentUser } from '~feature/auth/rest/decorators/current-user.decorator';
import { User } from '~feature/user/core/domain/entities/user.entity';

class SuggestCategoryResponseDto {
  @ApiProperty({ nullable: true })
  categoryId: string | null;

  @ApiProperty({ nullable: true })
  categoryName: string | null;
}

@ApiTags('AI')
@ApiBearerAuth('bearer')
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiCategoryService: AiCategoryService) {}

  @Post('suggest-category')
  @ApiOperation({ summary: 'Suggest a category for an item, expense, or income' })
  @ApiResponse({ status: 201, type: SuggestCategoryResponseDto })
  async suggestCategory(
    @Body() dto: SuggestCategoryRequestDto,
    @CurrentUser() user: User,
  ) {
    try {
      let result = null;

      switch (dto.type) {
        case 'item':
          if (dto.itemNames?.[0]) {
            result = await this.aiCategoryService.suggestItemCategory(
              user.id,
              dto.itemNames[0],
            );
          }
          break;
        case 'expense':
          if (dto.itemNames?.length) {
            result = await this.aiCategoryService.suggestExpenseCategory(
              user.id,
              dto.itemNames,
            );
          }
          break;
        case 'income':
          if (dto.note) {
            result = await this.aiCategoryService.suggestIncomeCategory(
              user.id,
              dto.note,
            );
          }
          break;
      }

      return {
        categoryId: result?.categoryId ?? null,
        categoryName: result?.categoryName ?? null,
      };
    } catch (error) {
      this.logger.warn(`suggest-category failed: ${error}`);
      return { categoryId: null, categoryName: null };
    }
  }
}
