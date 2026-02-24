import { Injectable } from '@nestjs/common';
import { FamilyService } from '~feature/family/core/application/services/family.service';
import { Transaction } from '~feature/transaction/core/domain/entities/transaction.entity';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

@Injectable()
export class ExpenseAuthService {
  constructor(private readonly familyService: FamilyService) {}

  async verifyTransactionAccess(
    transaction: Transaction,
    userId: string,
  ): Promise<void> {
    if (transaction.familyId) {
      const member = await this.familyService.findMember(
        transaction.familyId,
        userId,
      );
      if (!member) {
        throw new DomainForbiddenException('Not a member of this family');
      }
    } else {
      if (transaction.userId !== userId) {
        throw new DomainForbiddenException('Access denied');
      }
    }
  }
}
