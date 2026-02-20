import { Injectable } from '@nestjs/common';
import { CreatePaymentMethodUseCase } from '../use-cases/create-payment-method.use-case';
import { GetPaymentMethodByIdUseCase } from '../use-cases/get-payment-method-by-id.use-case';
import { ListPaymentMethodsUseCase } from '../use-cases/list-payment-methods.use-case';
import { UpdatePaymentMethodUseCase } from '../use-cases/update-payment-method.use-case';
import { DeletePaymentMethodUseCase } from '../use-cases/delete-payment-method.use-case';
import { RecalculateBalanceUseCase } from '../use-cases/recalculate-balance.use-case';
import { GetBalanceSummaryUseCase } from '../use-cases/get-balance-summary.use-case';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { BalanceSummaryItem } from '../../domain/repositories/payment-method.repository.interface';

@Injectable()
export class PaymentMethodService {
  constructor(
    private readonly createPaymentMethodUseCase: CreatePaymentMethodUseCase,
    private readonly getPaymentMethodByIdUseCase: GetPaymentMethodByIdUseCase,
    private readonly listPaymentMethodsUseCase: ListPaymentMethodsUseCase,
    private readonly updatePaymentMethodUseCase: UpdatePaymentMethodUseCase,
    private readonly deletePaymentMethodUseCase: DeletePaymentMethodUseCase,
    private readonly recalculateBalanceUseCase: RecalculateBalanceUseCase,
    private readonly getBalanceSummaryUseCase: GetBalanceSummaryUseCase,
  ) {}

  async create(dto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    return this.createPaymentMethodUseCase.execute(dto);
  }

  async findById(id: string, userId: string): Promise<PaymentMethod> {
    return this.getPaymentMethodByIdUseCase.execute(id, userId);
  }

  async findAll(userId: string): Promise<PaymentMethod[]> {
    return this.listPaymentMethodsUseCase.execute(userId);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.updatePaymentMethodUseCase.execute(id, userId, dto);
  }

  async delete(id: string, userId: string): Promise<void> {
    return this.deletePaymentMethodUseCase.execute(id, userId);
  }

  async recalculateBalance(id: string): Promise<void> {
    await this.recalculateBalanceUseCase.execute(id);
  }

  async getBalanceSummary(userId: string): Promise<BalanceSummaryItem[]> {
    return this.getBalanceSummaryUseCase.execute(userId);
  }
}
