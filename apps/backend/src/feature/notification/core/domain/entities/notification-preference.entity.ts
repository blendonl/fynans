export interface NotificationPreferenceProps {
  id: string;
  userId: string;
  enablePushNotifications: boolean;
  enableInAppNotifications: boolean;
  enableToastNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: Date;
  quietHoursEnd?: Date;
  typePreferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationPreference {
  private readonly props: NotificationPreferenceProps;

  constructor(props: NotificationPreferenceProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: NotificationPreferenceProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('NotificationPreference ID is required');
    }

    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
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

  get enablePushNotifications(): boolean {
    return this.props.enablePushNotifications;
  }

  get enableInAppNotifications(): boolean {
    return this.props.enableInAppNotifications;
  }

  get enableToastNotifications(): boolean {
    return this.props.enableToastNotifications;
  }

  get quietHoursEnabled(): boolean {
    return this.props.quietHoursEnabled;
  }

  get quietHoursStart(): Date | undefined {
    return this.props.quietHoursStart;
  }

  get quietHoursEnd(): Date | undefined {
    return this.props.quietHoursEnd;
  }

  get typePreferences(): Record<string, any> {
    return this.props.typePreferences;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): NotificationPreferenceProps {
    return { ...this.props };
  }
}
