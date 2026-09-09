import { Inject, Injectable } from '@nestjs/common';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  FamilyMemberRole,
  type IFamilyMembershipRepository,
} from '~common/authorization';
import { Transaction } from '~feature/transaction/core/domain/entities/transaction.entity';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const APPROVAL_ROLES = [FamilyMemberRole.OWNER, FamilyMemberRole.ADMIN];

@Injectable()
export class ExpenseAuthService {
  constructor(
    @Inject(FAMILY_MEMBERSHIP_REPOSITORY)
    private readonly familyMembershipRepository: IFamilyMembershipRepository,
  ) {}

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

    const role = await this.familyMembershipRepository.findRole(
      transaction.familyId,
      userId,
    );

    if (!role) {
      throw new DomainForbiddenException('Not a member of this family');
    }

    if (!APPROVAL_ROLES.includes(role)) {
      throw new DomainForbiddenException(
        'Only a family owner or admin can approve or reject an expense',
      );
    }
  }
}
