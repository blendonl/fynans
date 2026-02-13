import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { NotificationModule } from '../../notification/notification.module';
import { PrismaFamilyRepository } from './infrastructure/repositories/prisma-family.repository';
import { PrismaFamilyInvitationRepository } from './infrastructure/repositories/prisma-family-invitation.repository';
import { CreateFamilyUseCase } from './application/use-cases/create-family.use-case';
import { InviteMemberUseCase } from './application/use-cases/invite-member.use-case';
import { AcceptInvitationUseCase } from './application/use-cases/accept-invitation.use-case';
import { DeclineInvitationUseCase } from './application/use-cases/decline-invitation.use-case';
import { LeaveFamilyUseCase } from './application/use-cases/leave-family.use-case';
import { GetFamiliesUseCase } from './application/use-cases/get-families.use-case';
import { GetPendingInvitationsUseCase } from './application/use-cases/get-pending-invitations.use-case';
import { GetFamilyWithMembersUseCase } from './application/use-cases/get-family-with-members.use-case';
import { RemoveFamilyMemberUseCase } from './application/use-cases/remove-family-member.use-case';
import { VerifyFamilyMembershipUseCase } from './application/use-cases/verify-family-membership.use-case';
import { GetFamilyPendingInvitationsUseCase } from './application/use-cases/get-family-pending-invitations.use-case';
import { CancelInvitationUseCase } from './application/use-cases/cancel-invitation.use-case';
import { FamilyBalanceService } from './application/services/family-balance.service';
import { UserCoreModule } from '~feature/user/core/user-core.module';

@Module({
  imports: [PrismaModule, forwardRef(() => NotificationModule), UserCoreModule],
  providers: [
    {
      provide: 'FamilyRepository',
      useClass: PrismaFamilyRepository,
    },
    {
      provide: 'FamilyInvitationRepository',
      useClass: PrismaFamilyInvitationRepository,
    },
    CreateFamilyUseCase,
    InviteMemberUseCase,
    AcceptInvitationUseCase,
    DeclineInvitationUseCase,
    LeaveFamilyUseCase,
    GetFamiliesUseCase,
    GetPendingInvitationsUseCase,
    GetFamilyWithMembersUseCase,
    RemoveFamilyMemberUseCase,
    VerifyFamilyMembershipUseCase,
    GetFamilyPendingInvitationsUseCase,
    CancelInvitationUseCase,
    FamilyBalanceService,
  ],
  exports: [
    'FamilyRepository',
    'FamilyInvitationRepository',
    CreateFamilyUseCase,
    InviteMemberUseCase,
    AcceptInvitationUseCase,
    DeclineInvitationUseCase,
    LeaveFamilyUseCase,
    GetFamiliesUseCase,
    GetPendingInvitationsUseCase,
    GetFamilyWithMembersUseCase,
    RemoveFamilyMemberUseCase,
    VerifyFamilyMembershipUseCase,
    GetFamilyPendingInvitationsUseCase,
    CancelInvitationUseCase,
    FamilyBalanceService,
  ],
})
export class FamilyCoreModule {}
