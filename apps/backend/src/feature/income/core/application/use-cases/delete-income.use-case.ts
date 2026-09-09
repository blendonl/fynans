import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import {
  AuditAction,
  AuditEntity,
  RecordFinancialAuditUseCase,
} from '~common/audit';

@Injectable()
export class DeleteIncomeUseCase {
  constructor(
    @Inject('IncomeRepository')
    private readonly incomeRepository: IIncomeRepository,
    private readonly recordFinancialAudit: RecordFinancialAuditUseCase,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const income = await this.incomeRepository.findById(id);

    if (!income) {
      throw new DomainNotFoundException('Income not found');
    }

    await this.incomeRepository.delete(id);

    await this.recordFinancialAudit.execute({
      entity: AuditEntity.INCOME,
      entityId: id,
      action: AuditAction.DELETED,
      actorId: userId,
      transactionId: income.transactionId,
    });
  }
}
