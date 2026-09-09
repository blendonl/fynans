import { Injectable } from '@nestjs/common';
import { CreateTransactionUseCase } from '../../../../transaction/core/application/use-cases/create-transaction.use-case';
import { CreateTransactionDto } from '../../../../transaction/core/application/dto/create-transaction.dto';
import { TransactionType } from '../../../../transaction/core/domain/value-objects/transaction-type.vo';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import { PaymentMethodService } from '../../../../payment-method/core/application/services/payment-method.service';
import { PrismaService } from '~common/prisma/prisma.service';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
import { RecordIncomeDto } from '../dto/record-income.dto';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { CreateIncomeUseCase } from './create-income.use-case';
import { Income } from '../../domain/entities/income.entity';

@Injectable()
export class RecordIncomeUseCase {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly createIncomeUseCase: CreateIncomeUseCase,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: RecordIncomeDto): Promise<Income> {
    this.validate(dto);

    const status = dto.status ?? TransactionStatus.CONFIRMED;
    const isPending = status === TransactionStatus.PENDING;

    const income = await this.prisma.runInTransaction(async () => {
      const transaction = await this.createTransactionUseCase.execute(
        new CreateTransactionDto(
          dto.userId,
          TransactionType.INCOME,
          dto.amount,
          dto.recordedAt,
          dto.familyId,
          dto.paymentMethodId,
          status,
        ),
      );

      return this.createIncomeUseCase.execute(
        new CreateIncomeDto(
          transaction.id,
          dto.categoryId,
          dto.userId,
          undefined,
          dto.note?.trim() || undefined,
        ),
      );
    });

    if (dto.paymentMethodId && !isPending) {
      await this.paymentMethodService.recalculateBalance(dto.paymentMethodId);
    }

    return income;
  }

  private validate(dto: RecordIncomeDto): void {
    if (!dto.userId || dto.userId.trim() === '') {
      throw new DomainValidationException('User ID is required');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new DomainValidationException('Category ID is required');
    }

    if (dto.amount.lessThanOrEqualTo(0)) {
      throw new DomainValidationException('Amount must be positive');
    }
  }
}
