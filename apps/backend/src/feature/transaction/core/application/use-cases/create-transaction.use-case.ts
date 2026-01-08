import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { type ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import {
  Transaction,
  TransactionScope,
} from '../../domain/entities/transaction.entity';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { FamilyBalanceService } from '../../../../family/core/application/services/family-balance.service';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly familyBalanceService: FamilyBalanceService,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    this.validateTransactionData(dto);

    // If familyId is provided, verify user is a member
    if (dto.familyId) {
      const member = await this.familyRepository.findMember(
        dto.familyId,
        dto.userId,
      );
      if (!member) {
        throw new ForbiddenException('Not a member of this family');
      }
    }

    const transaction = await this.transactionRepository.create({
      userId: dto.userId,
      type: dto.type,
      value: new Decimal(dto.value),
      familyId: dto.familyId,
      scope: dto.familyId ? TransactionScope.FAMILY : TransactionScope.PERSONAL,
      recordedAt: dto.recordedAt || new Date(),
    } as Partial<Transaction>);

    if (dto.familyId) {
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
      throw new BadRequestException('Transaction value must be positive');
    }

    if (!dto.userId || dto.userId.trim() === '') {
      throw new BadRequestException('User ID is required');
    }

    if (!dto.type) {
      throw new BadRequestException('Transaction type is required');
    }
  }
}
