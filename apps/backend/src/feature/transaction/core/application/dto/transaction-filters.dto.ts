import { TransactionType } from '../../domain/value-objects/transaction-type.vo';
import { TransactionStatus } from '../../domain/value-objects/transaction-status.vo';
import { TransactionScope } from '../../domain/entities/transaction.entity';

export class TransactionFilters {
  userId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  familyId?: string;
  scope?: TransactionScope;
  paymentMethodId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  valueMin?: number;
  valueMax?: number;

  constructor(data?: Partial<TransactionFilters>) {
    this.userId = data?.userId;
    this.type = data?.type;
    this.status = data?.status;
    this.familyId = data?.familyId;
    this.scope = data?.scope;
    this.paymentMethodId = data?.paymentMethodId;
    this.dateFrom = data?.dateFrom;
    this.dateTo = data?.dateTo;
    this.valueMin = data?.valueMin;
    this.valueMax = data?.valueMax;
  }
}
