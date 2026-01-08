"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../common/prisma/prisma.module");
const notification_module_1 = require("../../notification/notification.module");
const prisma_family_repository_1 = require("./infrastructure/repositories/prisma-family.repository");
const prisma_family_invitation_repository_1 = require("./infrastructure/repositories/prisma-family-invitation.repository");
const create_family_use_case_1 = require("./application/use-cases/create-family.use-case");
const invite_member_use_case_1 = require("./application/use-cases/invite-member.use-case");
const accept_invitation_use_case_1 = require("./application/use-cases/accept-invitation.use-case");
const decline_invitation_use_case_1 = require("./application/use-cases/decline-invitation.use-case");
const leave_family_use_case_1 = require("./application/use-cases/leave-family.use-case");
const get_families_use_case_1 = require("./application/use-cases/get-families.use-case");
const get_pending_invitations_use_case_1 = require("./application/use-cases/get-pending-invitations.use-case");
const get_family_with_members_use_case_1 = require("./application/use-cases/get-family-with-members.use-case");
const remove_family_member_use_case_1 = require("./application/use-cases/remove-family-member.use-case");
const verify_family_membership_use_case_1 = require("./application/use-cases/verify-family-membership.use-case");
const family_balance_service_1 = require("./application/services/family-balance.service");
const user_core_module_1 = require("../../user/core/user-core.module");
let FamilyCoreModule = class FamilyCoreModule {
};
exports.FamilyCoreModule = FamilyCoreModule;
exports.FamilyCoreModule = FamilyCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_1.forwardRef)(() => notification_module_1.NotificationModule), user_core_module_1.UserCoreModule],
        providers: [
            {
                provide: 'FamilyRepository',
                useClass: prisma_family_repository_1.PrismaFamilyRepository,
            },
            {
                provide: 'FamilyInvitationRepository',
                useClass: prisma_family_invitation_repository_1.PrismaFamilyInvitationRepository,
            },
            create_family_use_case_1.CreateFamilyUseCase,
            invite_member_use_case_1.InviteMemberUseCase,
            accept_invitation_use_case_1.AcceptInvitationUseCase,
            decline_invitation_use_case_1.DeclineInvitationUseCase,
            leave_family_use_case_1.LeaveFamilyUseCase,
            get_families_use_case_1.GetFamiliesUseCase,
            get_pending_invitations_use_case_1.GetPendingInvitationsUseCase,
            get_family_with_members_use_case_1.GetFamilyWithMembersUseCase,
            remove_family_member_use_case_1.RemoveFamilyMemberUseCase,
            verify_family_membership_use_case_1.VerifyFamilyMembershipUseCase,
            family_balance_service_1.FamilyBalanceService,
        ],
        exports: [
            'FamilyRepository',
            'FamilyInvitationRepository',
            create_family_use_case_1.CreateFamilyUseCase,
            invite_member_use_case_1.InviteMemberUseCase,
            accept_invitation_use_case_1.AcceptInvitationUseCase,
            decline_invitation_use_case_1.DeclineInvitationUseCase,
            leave_family_use_case_1.LeaveFamilyUseCase,
            get_families_use_case_1.GetFamiliesUseCase,
            get_pending_invitations_use_case_1.GetPendingInvitationsUseCase,
            get_family_with_members_use_case_1.GetFamilyWithMembersUseCase,
            remove_family_member_use_case_1.RemoveFamilyMemberUseCase,
            verify_family_membership_use_case_1.VerifyFamilyMembershipUseCase,
            family_balance_service_1.FamilyBalanceService,
        ],
    })
], FamilyCoreModule);
//# sourceMappingURL=family-core.module.js.map