"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTemplateService = void 0;
const common_1 = require("@nestjs/common");
const notification_type_vo_1 = require("../../domain/value-objects/notification-type.vo");
let NotificationTemplateService = class NotificationTemplateService {
    generateTemplate(type, data) {
        switch (type) {
            case notification_type_vo_1.NotificationType.FAMILY_INVITATION_SENT:
                return {
                    title: 'Invitation Sent',
                    message: `You invited ${data.inviteeEmail} to join ${data.familyName}`,
                    actionUrl: `family/${data.familyId}`,
                };
            case notification_type_vo_1.NotificationType.FAMILY_INVITATION_RECEIVED:
                return {
                    title: 'Family Invitation',
                    message: `${data.inviterName} invited you to join ${data.familyName}`,
                    actionUrl: `family/invitations/${data.invitationId}`,
                };
            case notification_type_vo_1.NotificationType.FAMILY_INVITATION_ACCEPTED:
                return {
                    title: 'Invitation Accepted',
                    message: `${data.inviteeName} accepted your invitation to ${data.familyName}`,
                    actionUrl: `family/${data.familyId}`,
                };
            case notification_type_vo_1.NotificationType.FAMILY_INVITATION_DECLINED:
                return {
                    title: 'Invitation Declined',
                    message: `${data.inviteeName} declined your invitation to ${data.familyName}`,
                };
            case notification_type_vo_1.NotificationType.FAMILY_MEMBER_JOINED:
                return {
                    title: 'New Family Member',
                    message: `${data.memberName} joined ${data.familyName}`,
                    actionUrl: `family/${data.familyId}`,
                };
            case notification_type_vo_1.NotificationType.FAMILY_MEMBER_LEFT:
                return {
                    title: 'Member Left',
                    message: `${data.memberName} left ${data.familyName}`,
                    actionUrl: `family/${data.familyId}`,
                };
            case notification_type_vo_1.NotificationType.FAMILY_EXPENSE_CREATED:
                return {
                    title: 'New Expense',
                    message: `${data.userName} added an expense of $${data.amount} in ${data.familyName}`,
                    actionUrl: `expense/${data.expenseId}`,
                };
            case notification_type_vo_1.NotificationType.FAMILY_INCOME_CREATED:
                return {
                    title: 'New Income',
                    message: `${data.userName} added income of $${data.amount} in ${data.familyName}`,
                    actionUrl: `income/${data.incomeId}`,
                };
            case notification_type_vo_1.NotificationType.RECEIPT_PROCESSING_COMPLETE:
                return {
                    title: 'Receipt Processed',
                    message: `Your receipt has been processed successfully`,
                    actionUrl: data.receiptId ? `expenses/new?receiptId=${data.receiptId}` : undefined,
                };
            case notification_type_vo_1.NotificationType.TRANSACTION_MILESTONE_BUDGET_ALERT:
                return {
                    title: 'Budget Alert',
                    message: `You've reached ${data.percentage}% of your ${data.period} budget`,
                    actionUrl: 'analytics',
                };
            case notification_type_vo_1.NotificationType.TRANSACTION_MILESTONE_SPENDING_LIMIT:
                return {
                    title: 'Spending Limit',
                    message: `You've exceeded your spending limit for ${data.category}`,
                    actionUrl: 'analytics',
                };
            default:
                return {
                    title: 'Notification',
                    message: 'You have a new notification',
                };
        }
    }
};
exports.NotificationTemplateService = NotificationTemplateService;
exports.NotificationTemplateService = NotificationTemplateService = __decorate([
    (0, common_1.Injectable)()
], NotificationTemplateService);
//# sourceMappingURL=notification-template.service.js.map