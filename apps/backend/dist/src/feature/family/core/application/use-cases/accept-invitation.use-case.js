"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptInvitationUseCase = void 0;
const common_1 = require("@nestjs/common");
const family_member_entity_1 = require("../../domain/entities/family-member.entity");
const family_invitation_entity_1 = require("../../domain/entities/family-invitation.entity");
const create_notification_use_case_1 = require("../../../../notification/core/application/use-cases/create-notification.use-case");
const notification_type_vo_1 = require("../../../../notification/core/domain/value-objects/notification-type.vo");
const uuid_1 = require("uuid");
const user_service_1 = require("../../../../user/core/application/services/user.service");
let AcceptInvitationUseCase = class AcceptInvitationUseCase {
    familyRepository;
    invitationRepository;
    createNotificationUseCase;
    userService;
    constructor(familyRepository, invitationRepository, createNotificationUseCase, userService) {
        this.familyRepository = familyRepository;
        this.invitationRepository = invitationRepository;
        this.createNotificationUseCase = createNotificationUseCase;
        this.userService = userService;
    }
    async execute(invitationId, userId) {
        const invitation = await this.invitationRepository.findById(invitationId);
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (!invitation.canBeAccepted()) {
            throw new common_1.BadRequestException('Invitation expired or already processed');
        }
        const member = await this.familyRepository.addMember({
            id: (0, uuid_1.v4)(),
            familyId: invitation.familyId,
            userId: userId,
            role: family_member_entity_1.FamilyMemberRole.MEMBER,
            balance: 0,
            joinedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await this.invitationRepository.update(invitation.id, {
            status: family_invitation_entity_1.FamilyInvitationStatus.ACCEPTED,
            inviteeId: userId,
            id: invitation.id,
            familyId: invitation.familyId,
            inviterId: invitation.inviterId,
            inviteeEmail: invitation.inviteeEmail,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt,
            updatedAt: new Date(),
        });
        const family = await this.familyRepository.findById(invitation.familyId);
        const invitee = await this.userService.findById(userId);
        await this.createNotificationUseCase.execute({
            userId: invitation.inviterId,
            type: notification_type_vo_1.NotificationType.FAMILY_INVITATION_ACCEPTED,
            data: {
                invitationId: invitation.id,
                familyId: invitation.familyId,
                familyName: family?.name,
                inviteeName: invitee?.fullName,
            },
            deliveryMethods: [notification_type_vo_1.DeliveryMethod.IN_APP, notification_type_vo_1.DeliveryMethod.PUSH],
            priority: notification_type_vo_1.NotificationPriority.MEDIUM,
            familyId: invitation.familyId,
            invitationId: invitation.id,
        });
        const allMembers = await this.familyRepository.findMembers(invitation.familyId);
        for (const familyMember of allMembers) {
            if (familyMember.userId === userId)
                continue;
            await this.createNotificationUseCase.execute({
                userId: familyMember.userId,
                type: notification_type_vo_1.NotificationType.FAMILY_MEMBER_JOINED,
                data: {
                    familyId: invitation.familyId,
                    familyName: family?.name,
                    memberName: invitee?.fullName,
                    memberId: userId,
                },
                deliveryMethods: [notification_type_vo_1.DeliveryMethod.IN_APP, notification_type_vo_1.DeliveryMethod.PUSH],
                priority: notification_type_vo_1.NotificationPriority.LOW,
                familyId: invitation.familyId,
            });
        }
        return member;
    }
};
exports.AcceptInvitationUseCase = AcceptInvitationUseCase;
exports.AcceptInvitationUseCase = AcceptInvitationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('FamilyRepository')),
    __param(1, (0, common_1.Inject)('FamilyInvitationRepository')),
    __metadata("design:paramtypes", [Object, Object, create_notification_use_case_1.CreateNotificationUseCase,
        user_service_1.UserService])
], AcceptInvitationUseCase);
//# sourceMappingURL=accept-invitation.use-case.js.map