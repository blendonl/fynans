import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FINANCIAL_AUDIT_REPOSITORY } from './domain/repositories/financial-audit.repository.interface';
import { PrismaFinancialAuditRepository } from './infrastructure/repositories/prisma-financial-audit.repository';
import { ListFinancialAuditTrailUseCase } from './application/use-cases/list-financial-audit-trail.use-case';
import { RecordFinancialAuditUseCase } from './application/use-cases/record-financial-audit.use-case';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: FINANCIAL_AUDIT_REPOSITORY,
      useClass: PrismaFinancialAuditRepository,
    },
    RecordFinancialAuditUseCase,
    ListFinancialAuditTrailUseCase,
  ],
  exports: [
    FINANCIAL_AUDIT_REPOSITORY,
    RecordFinancialAuditUseCase,
    ListFinancialAuditTrailUseCase,
  ],
})
export class AuditModule {}
