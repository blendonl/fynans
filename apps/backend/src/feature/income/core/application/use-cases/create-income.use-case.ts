import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import { type IIncomeCategoryRepository } from '../../../../income-category/core/domain/repositories/income-category.repository.interface';
import { type IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { TransactionService } from '../../../../transaction/core/application/services/transaction.service';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '../../../../user/core/application/services/user.service';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { Income } from '../../domain/entities/income.entity';
import {
  NotificationType,
  DeliveryMethod,
  NotificationPriority,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';

@Injectable()
export class CreateIncomeUseCase {
  constructor(
    @Inject('IncomeRepository')
    private readonly incomeRepository: IIncomeRepository,
    @Inject('IncomeCategoryRepository')
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly transactionService: TransactionService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async execute(dto: CreateIncomeDto): Promise<Income> {
    await this.validate(dto);

    const income = await this.incomeRepository.create({
      transactionId: dto.transactionId,
      storeId: dto.storeId,
      categoryId: dto.categoryId,
    } as Partial<Income>);

    const transaction = await this.transactionService.findById(dto.transactionId);
    if (transaction.familyId) {
      const family = await this.familyRepository.findById(transaction.familyId);
      const incomeUser = await this.userService.findById(transaction.userId);
      const allMembers = await this.familyRepository.findMembers(transaction.familyId);

      for (const familyMember of allMembers) {
        if (familyMember.userId === transaction.userId) continue;

        await this.createNotificationUseCase.execute({
          userId: familyMember.userId,
          type: NotificationType.FAMILY_INCOME_CREATED,
          data: {
            incomeId: income.id,
            familyId: transaction.familyId,
            familyName: family?.name,
            userName: incomeUser?.fullName,
            amount: transaction.value.toString(),
          },
          deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
          priority: NotificationPriority.LOW,
          familyId: transaction.familyId,
        });
      }
    }

    return income;
  }

  private async validate(dto: CreateIncomeDto): Promise<void> {
    if (!dto.transactionId || dto.transactionId.trim() === '') {
      throw new BadRequestException('Transaction ID is required');
    }

    if (!dto.storeId || dto.storeId.trim() === '') {
      throw new BadRequestException('Store ID is required');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new BadRequestException('Category ID is required');
    }

    const category = await this.incomeCategoryRepository.findById(
      dto.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Income category not found');
    }

    const existingIncome = await this.incomeRepository.findByTransactionId(
      dto.transactionId,
    );
    if (existingIncome) {
      throw new ConflictException(
        'Income already exists for this transaction',
      );
    }
  }
}
