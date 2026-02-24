import {
  NotificationType,
  NotificationPriority,
  DeliveryMethod,
} from '../value-objects/notification-type.vo';

export interface NotificationProps {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  deliveryMethods: DeliveryMethod[];
  isRead: boolean;
  readAt?: Date;
  isInteracted: boolean;
  interactedAt?: Date;
  actionUrl?: string;
  familyId?: string;
  transactionId?: string;
  invitationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Notification {
  private props: NotificationProps;

  constructor(props: NotificationProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: NotificationProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Notification ID is required');
    }

    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!props.type) {
      throw new Error('Notification type is required');
    }

    if (!props.title || props.title.trim() === '') {
      throw new Error('Notification title is required');
    }

    if (!props.message || props.message.trim() === '') {
      throw new Error('Notification message is required');
    }

    if (!Array.isArray(props.deliveryMethods) || props.deliveryMethods.length === 0) {
      throw new Error('At least one delivery method is required');
    }

    if (!props.createdAt) {
      throw new Error('Created date is required');
    }

    if (!props.updatedAt) {
      throw new Error('Updated date is required');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get priority(): NotificationPriority {
    return this.props.priority;
  }

  get title(): string {
    return this.props.title;
  }

  get message(): string {
    return this.props.message;
  }

  get data(): Record<string, any> | undefined {
    return this.props.data;
  }

  get deliveryMethods(): DeliveryMethod[] {
    return this.props.deliveryMethods;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get readAt(): Date | undefined {
    return this.props.readAt;
  }

  get isInteracted(): boolean {
    return this.props.isInteracted;
  }

  get interactedAt(): Date | undefined {
    return this.props.interactedAt;
  }

  get actionUrl(): string | undefined {
    return this.props.actionUrl;
  }

  get familyId(): string | undefined {
    return this.props.familyId;
  }

  get transactionId(): string | undefined {
    return this.props.transactionId;
  }

  get invitationId(): string | undefined {
    return this.props.invitationId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isExpired(expiryDays: number = 30): boolean {
    const expiryDate = new Date(this.props.createdAt);
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    return new Date() > expiryDate;
  }

  toJSON(): NotificationProps {
    return { ...this.props };
  }
}
