import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import { type IIncomeCategoryRepository } from '../../../../income-category/core/domain/repositories/income-category.repository.interface';
import { type ITransactionRepository } from '~feature/transaction/core/domain/repositories/transaction.repository.interface';
import { UpdateIncomeDto } from '../dto/update-income.dto';
import { Income } from '../../domain/entities/income.entity';

@Injectable()
export class UpdateIncomeUseCase {
  constructor(
    @Inject('IncomeRepository')
    private readonly incomeRepository: IIncomeRepository,
    @Inject('IncomeCategoryRepository')
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(id: string, dto: UpdateIncomeDto): Promise<Income> {
    const income = await this.incomeRepository.findById(id);

    if (!income) {
      throw new NotFoundException('Income not found');
    }

    await this.validate(dto);

    const updated = await this.incomeRepository.update(id, {
      categoryId: dto.categoryId,
    } as Partial<Income>);

    const txUpdates: Record<string, unknown> = {};
    if (dto.amount !== undefined) txUpdates.value = dto.amount;
    if (dto.recordedAt !== undefined) txUpdates.recordedAt = dto.recordedAt;
    if (dto.paymentMethodId !== undefined)
      txUpdates.paymentMethodId = dto.paymentMethodId;

    if (Object.keys(txUpdates).length > 0) {
      await this.transactionRepository.update(
        income.transactionId!,
        txUpdates as any,
      );
    }

    if (Object.keys(txUpdates).length > 0) {
      return (await this.incomeRepository.findById(id))!;
    }

    return updated;
  }

  private async validate(dto: UpdateIncomeDto): Promise<void> {
    if (dto.categoryId !== undefined) {
      const category = await this.incomeCategoryRepository.findById(
        dto.categoryId,
      );
      if (!category) {
        throw new BadRequestException('Income category not found');
      }
    }
  }
}
