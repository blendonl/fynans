"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionScope = exports.TransactionType = exports.NotificationPriority = exports.NotificationDeliveryMethod = exports.NotificationType = exports.FamilyInvitationStatus = exports.FamilyMemberRole = void 0;
exports.FamilyMemberRole = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER'
};
exports.FamilyInvitationStatus = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
};
exports.NotificationType = {
    FAMILY_INVITATION_SENT: 'FAMILY_INVITATION_SENT',
    FAMILY_INVITATION_RECEIVED: 'FAMILY_INVITATION_RECEIVED',
    FAMILY_INVITATION_ACCEPTED: 'FAMILY_INVITATION_ACCEPTED',
    FAMILY_INVITATION_DECLINED: 'FAMILY_INVITATION_DECLINED',
    FAMILY_MEMBER_JOINED: 'FAMILY_MEMBER_JOINED',
    FAMILY_MEMBER_LEFT: 'FAMILY_MEMBER_LEFT',
    FAMILY_EXPENSE_CREATED: 'FAMILY_EXPENSE_CREATED',
    FAMILY_INCOME_CREATED: 'FAMILY_INCOME_CREATED',
    TRANSACTION_MILESTONE_BUDGET_ALERT: 'TRANSACTION_MILESTONE_BUDGET_ALERT',
    TRANSACTION_MILESTONE_SPENDING_LIMIT: 'TRANSACTION_MILESTONE_SPENDING_LIMIT',
    RECEIPT_PROCESSING_COMPLETE: 'RECEIPT_PROCESSING_COMPLETE'
};
exports.NotificationDeliveryMethod = {
    PUSH: 'PUSH',
    IN_APP: 'IN_APP',
    TOAST: 'TOAST'
};
exports.NotificationPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
};
exports.TransactionType = {
    EXPENSE: 'EXPENSE',
    INCOME: 'INCOME'
};
exports.TransactionScope = {
    PERSONAL: 'PERSONAL',
    FAMILY: 'FAMILY'
};
//# sourceMappingURL=enums.js.map