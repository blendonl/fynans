import { Injectable, Inject } from '@nestjs/common';
import { INotificationPreferenceRepository } from '../../domain/repositories/notification-preference.repository.interface';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';

export interface UpdateNotificationPreferencesDto {
  userId: string;
  enablePushNotifications?: boolean;
  enableInAppNotifications?: boolean;
  enableToastNotifications?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: Date;
  quietHoursEnd?: Date;
  typePreferences?: Record<string, any>;
}

@Injectable()
export class UpdateNotificationPreferencesUseCase {
  constructor(
    @Inject('NotificationPreferenceRepository')
    private readonly preferenceRepository: INotificationPreferenceRepository,
  ) {}

  async execute(dto: UpdateNotificationPreferencesDto): Promise<NotificationPreference> {
    await this.preferenceRepository.getOrCreateDefaults(dto.userId);

    return await this.preferenceRepository.update(dto.userId, dto);
  }
}
