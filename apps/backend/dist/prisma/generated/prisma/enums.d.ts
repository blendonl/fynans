export declare const FamilyMemberRole: {
    readonly OWNER: "OWNER";
    readonly ADMIN: "ADMIN";
    readonly MEMBER: "MEMBER";
};
export type FamilyMemberRole = (typeof FamilyMemberRole)[keyof typeof FamilyMemberRole];
export declare const FamilyInvitationStatus: {
    readonly PENDING: "PENDING";
    readonly ACCEPTED: "ACCEPTED";
    readonly REJECTED: "REJECTED";
    readonly CANCELLED: "CANCELLED";
};
export type FamilyInvitationStatus = (typeof FamilyInvitationStatus)[keyof typeof FamilyInvitationStatus];
export declare const NotificationType: {
    readonly FAMILY_INVITATION_SENT: "FAMILY_INVITATION_SENT";
    readonly FAMILY_INVITATION_RECEIVED: "FAMILY_INVITATION_RECEIVED";
    readonly FAMILY_INVITATION_ACCEPTED: "FAMILY_INVITATION_ACCEPTED";
    readonly FAMILY_INVITATION_DECLINED: "FAMILY_INVITATION_DECLINED";
    readonly FAMILY_MEMBER_JOINED: "FAMILY_MEMBER_JOINED";
    readonly FAMILY_MEMBER_LEFT: "FAMILY_MEMBER_LEFT";
    readonly FAMILY_EXPENSE_CREATED: "FAMILY_EXPENSE_CREATED";
    readonly FAMILY_INCOME_CREATED: "FAMILY_INCOME_CREATED";
    readonly TRANSACTION_MILESTONE_BUDGET_ALERT: "TRANSACTION_MILESTONE_BUDGET_ALERT";
    readonly TRANSACTION_MILESTONE_SPENDING_LIMIT: "TRANSACTION_MILESTONE_SPENDING_LIMIT";
    readonly RECEIPT_PROCESSING_COMPLETE: "RECEIPT_PROCESSING_COMPLETE";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export declare const NotificationDeliveryMethod: {
    readonly PUSH: "PUSH";
    readonly IN_APP: "IN_APP";
    readonly TOAST: "TOAST";
};
export type NotificationDeliveryMethod = (typeof NotificationDeliveryMethod)[keyof typeof NotificationDeliveryMethod];
export declare const NotificationPriority: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority];
export declare const TransactionType: {
    readonly EXPENSE: "EXPENSE";
    readonly INCOME: "INCOME";
};
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
export declare const TransactionScope: {
    readonly PERSONAL: "PERSONAL";
    readonly FAMILY: "FAMILY";
};
export type TransactionScope = (typeof TransactionScope)[keyof typeof TransactionScope];
