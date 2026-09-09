import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  FINANCIAL_AUDIT_REPOSITORY,
  type IFinancialAuditRepository,
  type RecordAuditEntryData,
} from '../../domain/repositories/financial-audit.repository.interface';

@Injectable()
export class RecordFinancialAuditUseCase {
  private readonly logger = new Logger(RecordFinancialAuditUseCase.name);

  constructor(
    @Inject(FINANCIAL_AUDIT_REPOSITORY)
    private readonly auditRepository: IFinancialAuditRepository,
  ) {}

  async execute(data: RecordAuditEntryData): Promise<void> {
    try {
      await this.auditRepository.record(data);
    } catch (error) {
      this.logger.error(
        `Failed to record ${data.action} on ${data.entity} ${data.entityId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
