"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryMethod = exports.NotificationPriority = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["FAMILY_INVITATION_SENT"] = "FAMILY_INVITATION_SENT";
    NotificationType["FAMILY_INVITATION_RECEIVED"] = "FAMILY_INVITATION_RECEIVED";
    NotificationType["FAMILY_INVITATION_ACCEPTED"] = "FAMILY_INVITATION_ACCEPTED";
    NotificationType["FAMILY_INVITATION_DECLINED"] = "FAMILY_INVITATION_DECLINED";
    NotificationType["FAMILY_MEMBER_JOINED"] = "FAMILY_MEMBER_JOINED";
    NotificationType["FAMILY_MEMBER_LEFT"] = "FAMILY_MEMBER_LEFT";
    NotificationType["FAMILY_EXPENSE_CREATED"] = "FAMILY_EXPENSE_CREATED";
    NotificationType["FAMILY_INCOME_CREATED"] = "FAMILY_INCOME_CREATED";
    NotificationType["TRANSACTION_MILESTONE_BUDGET_ALERT"] = "TRANSACTION_MILESTONE_BUDGET_ALERT";
    NotificationType["TRANSACTION_MILESTONE_SPENDING_LIMIT"] = "TRANSACTION_MILESTONE_SPENDING_LIMIT";
    NotificationType["RECEIPT_PROCESSING_COMPLETE"] = "RECEIPT_PROCESSING_COMPLETE";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "LOW";
    NotificationPriority["MEDIUM"] = "MEDIUM";
    NotificationPriority["HIGH"] = "HIGH";
    NotificationPriority["URGENT"] = "URGENT";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
var DeliveryMethod;
(function (DeliveryMethod) {
    DeliveryMethod["PUSH"] = "PUSH";
    DeliveryMethod["IN_APP"] = "IN_APP";
    DeliveryMethod["TOAST"] = "TOAST";
})(DeliveryMethod || (exports.DeliveryMethod = DeliveryMethod = {}));
//# sourceMappingURL=notification-type.vo.js.map