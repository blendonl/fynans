export interface WebPushSubscriptionProps {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class WebPushSubscription {
  private props: WebPushSubscriptionProps;

  constructor(props: WebPushSubscriptionProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: WebPushSubscriptionProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('WebPushSubscription ID is required');
    }

    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!props.endpoint || props.endpoint.trim() === '') {
      throw new Error('Endpoint is required');
    }

    if (!props.p256dh || props.p256dh.trim() === '') {
      throw new Error('p256dh key is required');
    }

    if (!props.auth || props.auth.trim() === '') {
      throw new Error('Auth key is required');
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

  get endpoint(): string {
    return this.props.endpoint;
  }

  get p256dh(): string {
    return this.props.p256dh;
  }

  get auth(): string {
    return this.props.auth;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastUsed(): Date {
    return this.props.lastUsed;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateLastUsed(): void {
    this.props.lastUsed = new Date();
    this.props.updatedAt = new Date();
  }

  toJSON(): WebPushSubscriptionProps {
    return { ...this.props };
  }
}
