import { Injectable, Inject } from '@nestjs/common';
import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import { type IIncomeCategoryRepository } from '../../../../income-category/core/domain/repositories/income-category.repository.interface';
import { TransactionService } from '../../../../transaction/core/application/services/transaction.service';
import { NotifyFamilyMembersService } from '~common/services/notify-family-members.service';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { Income } from '../../domain/entities/income.entity';
import { NotificationType } from '../../../../notification/core/domain/value-objects/notification-type.vo';
import {
  DomainValidationException,
  DomainNotFoundException,
  DomainConflictException,
} from '~common/exceptions/domain.exceptions';

@Injectable()
export class CreateIncomeUseCase {
  constructor(
    @Inject('IncomeRepository')
    private readonly incomeRepository: IIncomeRepository,
    @Inject('IncomeCategoryRepository')
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
    private readonly transactionService: TransactionService,
    private readonly notifyFamilyMembersService: NotifyFamilyMembersService,
  ) {}

  async execute(dto: CreateIncomeDto): Promise<Income> {
    await this.validate(dto);

    const income = await this.incomeRepository.create({
      transactionId: dto.transactionId,
      storeId: dto.storeId,
      categoryId: dto.categoryId,
    } as Partial<Income>);

    const transaction = await this.transactionService.findById(dto.transactionId);

    await this.incomeCategoryRepository.linkToUser(dto.categoryId, transaction.userId);

    if (transaction.familyId) {
      await this.notifyFamilyMembersService.notify({
        familyId: transaction.familyId,
        actorUserId: transaction.userId,
        type: NotificationType.FAMILY_INCOME_CREATED,
        data: {
          incomeId: income.id,
          amount: transaction.value.toString(),
        },
      });
    }

    return income;
  }

  private async validate(dto: CreateIncomeDto): Promise<void> {
    if (!dto.transactionId || dto.transactionId.trim() === '') {
      throw new DomainValidationException('Transaction ID is required');
    }

    if (!dto.storeId || dto.storeId.trim() === '') {
      throw new DomainValidationException('Store ID is required');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new DomainValidationException('Category ID is required');
    }

    const category = await this.incomeCategoryRepository.findById(
      dto.categoryId,
    );
    if (!category) {
      throw new DomainNotFoundException('Income category not found');
    }

    const existingIncome = await this.incomeRepository.findByTransactionId(
      dto.transactionId,
    );
    if (existingIncome) {
      throw new DomainConflictException(
        'Income already exists for this transaction',
      );
    }
  }
}
