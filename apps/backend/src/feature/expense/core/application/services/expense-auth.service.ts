import { Injectable } from '@nestjs/common';
import { FamilyService } from '~feature/family/core/application/services/family.service';
import { Transaction } from '~feature/transaction/core/domain/entities/transaction.entity';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

@Injectable()
export class ExpenseAuthService {
  constructor(private readonly familyService: FamilyService) {}

  async verifyApprovalAuthority(
    transaction: Transaction,
    userId: string,
  ): Promise<void> {
    if (transaction.userId === userId) {
      throw new DomainForbiddenException(
        'The submitter cannot approve or reject their own expense',
      );
    }

    if (!transaction.familyId) {
      throw new DomainForbiddenException(
        'Only a family owner or admin can approve or reject an expense',
      );
    }

    const member = await this.familyService.findMember(
      transaction.familyId,
      userId,
    );
    if (!member) {
      throw new DomainForbiddenException('Not a member of this family');
    }

    if (!member.canManageMembers()) {
      throw new DomainForbiddenException(
        'Only a family owner or admin can approve or reject an expense',
      );
    }
  }

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
