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
exports.DeclineInvitationUseCase = void 0;
const common_1 = require("@nestjs/common");
const family_invitation_entity_1 = require("../../domain/entities/family-invitation.entity");
const create_notification_use_case_1 = require("../../../../notification/core/application/use-cases/create-notification.use-case");
const notification_type_vo_1 = require("../../../../notification/core/domain/value-objects/notification-type.vo");
const user_service_1 = require("../../../../user/core/application/services/user.service");
let DeclineInvitationUseCase = class DeclineInvitationUseCase {
    invitationRepository;
    familyRepository;
    createNotificationUseCase;
    userService;
    constructor(invitationRepository, familyRepository, createNotificationUseCase, userService) {
        this.invitationRepository = invitationRepository;
        this.familyRepository = familyRepository;
        this.createNotificationUseCase = createNotificationUseCase;
        this.userService = userService;
    }
    async execute(invitationId, userId) {
        const invitation = await this.invitationRepository.findById(invitationId);
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (!invitation.canBeDeclined()) {
            throw new common_1.BadRequestException('Invitation expired or already processed');
        }
        await this.invitationRepository.update(invitation.id, {
            status: family_invitation_entity_1.FamilyInvitationStatus.REJECTED,
            id: invitation.id,
            familyId: invitation.familyId,
            inviterId: invitation.inviterId,
            inviteeId: invitation.inviteeId,
            inviteeEmail: invitation.inviteeEmail,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt,
            updatedAt: new Date(),
        });
        const family = await this.familyRepository.findById(invitation.familyId);
        const decliner = await this.userService.findById(userId);
        await this.createNotificationUseCase.execute({
            userId: invitation.inviterId,
            type: notification_type_vo_1.NotificationType.FAMILY_INVITATION_DECLINED,
            data: {
                invitationId: invitation.id,
                familyId: invitation.familyId,
                familyName: family?.name,
                inviteeName: decliner?.fullName || invitation.inviteeEmail,
            },
            deliveryMethods: [notification_type_vo_1.DeliveryMethod.IN_APP, notification_type_vo_1.DeliveryMethod.PUSH],
            priority: notification_type_vo_1.NotificationPriority.LOW,
            familyId: invitation.familyId,
            invitationId: invitation.id,
        });
    }
};
exports.DeclineInvitationUseCase = DeclineInvitationUseCase;
exports.DeclineInvitationUseCase = DeclineInvitationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('FamilyInvitationRepository')),
    __param(1, (0, common_1.Inject)('FamilyRepository')),
    __metadata("design:paramtypes", [Object, Object, create_notification_use_case_1.CreateNotificationUseCase,
        user_service_1.UserService])
], DeclineInvitationUseCase);
//# sourceMappingURL=decline-invitation.use-case.js.map