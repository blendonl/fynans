import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from '~common/dto/base-query.dto';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';

export class QueryIncomeDto extends BaseQueryDto {
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;
}
