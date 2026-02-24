export interface DeviceTokenProps {
  id: string;
  userId: string;
  expoPushToken: string;
  platform?: string;
  deviceId?: string;
  deviceName?: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class DeviceToken {
  private props: DeviceTokenProps;

  constructor(props: DeviceTokenProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: DeviceTokenProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('DeviceToken ID is required');
    }

    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!props.expoPushToken || props.expoPushToken.trim() === '') {
      throw new Error('Expo push token is required');
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

  get expoPushToken(): string {
    return this.props.expoPushToken;
  }

  get platform(): string | undefined {
    return this.props.platform;
  }

  get deviceId(): string | undefined {
    return this.props.deviceId;
  }

  get deviceName(): string | undefined {
    return this.props.deviceName;
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

  toJSON(): DeviceTokenProps {
    return { ...this.props };
  }
}
