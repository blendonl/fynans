import { Inject, Injectable } from '@nestjs/common';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { type IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { FamilyBalanceService } from '../services/family-balance.service';
import { FamilyBalanceReconciliation } from '../dto/family-balance-reconciliation.dto';

@Injectable()
export class ReconcileFamilyBalancesUseCase {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly familyBalanceService: FamilyBalanceService,
  ) {}

  async execute(
    familyId: string,
    userId: string,
  ): Promise<FamilyBalanceReconciliation> {
    const member = await this.familyRepository.findMember(familyId, userId);

    if (!member?.canManageMembers()) {
      throw new DomainForbiddenException(
        'Only a family owner or admin can reconcile balances',
      );
    }

    return this.familyBalanceService.reconcile(familyId);
  }
}
