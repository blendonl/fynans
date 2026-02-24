import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '~feature/auth/rest/decorators/current-user.decorator';
import { User } from '~feature/user/core/domain/entities/user.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { ReceiptFilters } from '../../core/application/dto/receipt-filters.dto';
import { ListStoredReceiptsUseCase } from '../../core/application/use-cases/list-stored-receipts.use-case';
import { GetStoredReceiptUseCase } from '../../core/application/use-cases/get-stored-receipt.use-case';
import { DeleteStoredReceiptUseCase } from '../../core/application/use-cases/delete-stored-receipt.use-case';
import { LinkReceiptToExpenseUseCase } from '../../core/application/use-cases/link-receipt-to-expense.use-case';
import { StoredReceiptResponseDto } from '../dto/stored-receipt-response.dto';
import { QueryStoredReceiptDto } from '../dto/query-stored-receipt.dto';
import { LinkReceiptToExpenseDto } from '../dto/link-receipt-to-expense.dto';

@ApiTags('Receipt')
@ApiBearerAuth('bearer')
@Controller('receipts')
export class StoredReceiptController {
  constructor(
    private readonly listStoredReceiptsUseCase: ListStoredReceiptsUseCase,
    private readonly getStoredReceiptUseCase: GetStoredReceiptUseCase,
    private readonly deleteStoredReceiptUseCase: DeleteStoredReceiptUseCase,
    private readonly linkReceiptToExpenseUseCase: LinkReceiptToExpenseUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List stored receipts' })
  @ApiResponse({ status: 200, type: [StoredReceiptResponseDto] })
  async findAll(
    @Query() query: QueryStoredReceiptDto,
    @CurrentUser() user: User,
  ) {
    const filters = ReceiptFilters.fromQuery(query, user.id);
    const pagination = new Pagination(query.page, query.limit);

    const result = await this.listStoredReceiptsUseCase.execute(
      filters,
      pagination,
    );

    return {
      data: result.data.map((r) => StoredReceiptResponseDto.fromEntity(r)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stored receipt with download URL' })
  @ApiResponse({ status: 200, type: StoredReceiptResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const { receipt, downloadUrl } =
      await this.getStoredReceiptUseCase.execute(id, user.id);

    return StoredReceiptResponseDto.fromEntity(receipt, downloadUrl);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a stored receipt and its file' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.deleteStoredReceiptUseCase.execute(id, user.id);
  }

  @Patch(':id/link-expense')
  @ApiOperation({ summary: 'Link a receipt to an expense' })
  @ApiResponse({ status: 200, type: StoredReceiptResponseDto })
  async linkToExpense(
    @Param('id') id: string,
    @Body() body: LinkReceiptToExpenseDto,
    @CurrentUser() user: User,
  ) {
    const receipt = await this.linkReceiptToExpenseUseCase.execute(
      id,
      body.expenseId,
      user.id,
    );

    return StoredReceiptResponseDto.fromEntity(receipt);
  }
}
