import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { Transaction } from '../../../../transaction/core/domain/entities/transaction.entity';

@Injectable()
export class FamilyBalanceService {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async updateBalancesAfterTransaction(
    familyId: string,
    userId: string,
    transaction: Transaction,
  ): Promise<void> {
    const amount = transaction.value.toNumber();
    const isIncome = transaction.isIncome();
    const delta = isIncome ? amount : -amount;

    // Update family total balance
    const family = await this.familyRepository.findById(familyId);
    if (!family) {
      throw new DomainNotFoundException('Family not found');
    }

    await this.familyRepository.updateFamilyBalance(
      familyId,
      family.balance + delta,
    );

    // Update user's individual balance within family
    const member = await this.familyRepository.findMember(familyId, userId);
    if (!member) {
      throw new DomainNotFoundException('Not a family member');
    }

    await this.familyRepository.updateMemberBalance(
      familyId,
      userId,
      member.balance + delta,
    );
  }

  async recalculateBalances(familyId: string): Promise<void> {
    // Recalculate from scratch based on all transactions
    const totalBalance =
      await this.familyRepository.calculateFamilyBalance(familyId);
    await this.familyRepository.updateFamilyBalance(familyId, totalBalance);

    // Note: Individual member balances would need transaction history per member
    // This is simplified - in production you'd want to track which member created each transaction
  }
}
