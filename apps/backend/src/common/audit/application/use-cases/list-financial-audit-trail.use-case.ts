import { Inject, Injectable } from '@nestjs/common';
import { AuditEntity } from '../../domain/audit-entity';
import { FinancialAuditEntry } from '../../domain/entities/financial-audit-entry.entity';
import {
  FINANCIAL_AUDIT_REPOSITORY,
  type IFinancialAuditRepository,
} from '../../domain/repositories/financial-audit.repository.interface';

@Injectable()
export class ListFinancialAuditTrailUseCase {
  constructor(
    @Inject(FINANCIAL_AUDIT_REPOSITORY)
    private readonly auditRepository: IFinancialAuditRepository,
  ) {}

  async execute(
    entity: AuditEntity,
    entityId: string,
  ): Promise<FinancialAuditEntry[]> {
    return this.auditRepository.findForEntity(entity, entityId);
  }
}
