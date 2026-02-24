import { Injectable, Inject } from '@nestjs/common';
import { type ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import {
  Transaction,
  TransactionScope,
} from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/value-objects/transaction-status.vo';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { FamilyService } from '../../../../family/core/application/services/family.service';
import { FamilyBalanceService } from '../../../../family/core/application/services/family-balance.service';
import {
  DomainForbiddenException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly familyService: FamilyService,
    private readonly familyBalanceService: FamilyBalanceService,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    this.validateTransactionData(dto);

    if (dto.familyId) {
      const member = await this.familyService.findMember(
        dto.familyId,
        dto.userId,
      );
      if (!member) {
        throw new DomainForbiddenException('Not a member of this family');
      }
    }

    const status = dto.status ?? TransactionStatus.CONFIRMED;

    const transaction = await this.transactionRepository.create({
      userId: dto.userId,
      type: dto.type,
      status,
      value: new Decimal(dto.value),
      familyId: dto.familyId,
      scope: dto.familyId ? TransactionScope.FAMILY : TransactionScope.PERSONAL,
      recordedAt: dto.recordedAt || new Date(),
      paymentMethodId: dto.paymentMethodId,
    } as Partial<Transaction>);

    if (dto.familyId && status === TransactionStatus.CONFIRMED) {
      await this.familyBalanceService.updateBalancesAfterTransaction(
        dto.familyId,
        dto.userId,
        transaction,
      );
    }

    return transaction;
  }

  private validateTransactionData(dto: CreateTransactionDto): void {
    if (dto.value <= 0) {
      throw new DomainValidationException('Transaction value must be positive');
    }

    if (!dto.userId || dto.userId.trim() === '') {
      throw new DomainValidationException('User ID is required');
    }

    if (!dto.type) {
      throw new DomainValidationException('Transaction type is required');
    }
  }
}
