import { Injectable } from '@nestjs/common';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';

export interface NotificationTemplate {
  title: string;
  message: string;
  actionUrl?: string;
}

@Injectable()
export class NotificationTemplateService {
  generateTemplate(
    type: NotificationType,
    data: Record<string, any>,
  ): NotificationTemplate {
    switch (type) {
      case NotificationType.FAMILY_INVITATION_SENT:
        return {
          title: 'Invitation Sent',
          message: `You invited ${data.inviteeEmail} to join ${data.familyName}`,
          actionUrl: `families/${data.familyId}`,
        };

      case NotificationType.FAMILY_INVITATION_RECEIVED:
        return {
          title: 'Family Invitation',
          message: `${data.inviterName} invited you to join ${data.familyName}`,
          actionUrl: `families/invitations`,
        };

      case NotificationType.FAMILY_INVITATION_ACCEPTED:
        return {
          title: 'Invitation Accepted',
          message: `${data.inviteeName} accepted your invitation to ${data.familyName}`,
          actionUrl: `families/${data.familyId}`,
        };

      case NotificationType.FAMILY_INVITATION_DECLINED:
        return {
          title: 'Invitation Declined',
          message: `${data.inviteeName} declined your invitation to ${data.familyName}`,
        };

      case NotificationType.FAMILY_MEMBER_JOINED:
        return {
          title: 'New Family Member',
          message: `${data.memberName} joined ${data.familyName}`,
          actionUrl: `families/${data.familyId}`,
        };

      case NotificationType.FAMILY_MEMBER_LEFT:
        return {
          title: 'Member Left',
          message: `${data.memberName} left ${data.familyName}`,
          actionUrl: `families/${data.familyId}`,
        };

      case NotificationType.FAMILY_EXPENSE_CREATED:
        return {
          title: 'New Expense',
          message: `${data.userName} added an expense of $${data.amount} in ${data.familyName}`,
          actionUrl: `transactions/${data.expenseId}`,
        };

      case NotificationType.FAMILY_INCOME_CREATED:
        return {
          title: 'New Income',
          message: `${data.userName} added income of $${data.amount} in ${data.familyName}`,
          actionUrl: `transactions/${data.incomeId}?type=income`,
        };

      case NotificationType.RECEIPT_PROCESSING_COMPLETE:
        return {
          title: 'Receipt Processed',
          message: `Your receipt has been processed successfully`,
          actionUrl: data.receiptId ? `add?receiptId=${data.receiptId}` : undefined,
        };

      case NotificationType.TRANSACTION_MILESTONE_BUDGET_ALERT:
        return {
          title: 'Budget Alert',
          message: `You've reached ${data.percentage}% of your ${data.period} budget`,
          actionUrl: 'transactions',
        };

      case NotificationType.TRANSACTION_MILESTONE_SPENDING_LIMIT:
        return {
          title: 'Spending Limit',
          message: `You've exceeded your spending limit for ${data.category}`,
          actionUrl: 'transactions',
        };

      case NotificationType.BASKET_ITEM_ADDED:
        return {
          title: 'Item Added to Basket',
          message: `${data.addedByName} added '${data.itemName}' to the family basket`,
          actionUrl: 'basket',
        };

      case NotificationType.BASKET_ITEMS_BOUGHT:
        return {
          title: 'Basket Items Bought',
          message: `${data.buyerName} bought ${data.itemCount} item${data.itemCount !== 1 ? 's' : ''} ($${data.totalAmount}) from the family basket`,
          actionUrl: 'basket',
        };

      default:
        return {
          title: 'Notification',
          message: 'You have a new notification',
        };
    }
  }
}
