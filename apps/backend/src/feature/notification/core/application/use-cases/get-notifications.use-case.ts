import { Injectable, Inject } from '@nestjs/common';
import {
  INotificationRepository,
  NotificationFilters,
} from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(filters: NotificationFilters): Promise<{ data: Notification[]; total: number }> {
    return await this.notificationRepository.findByUserId(filters);
  }
}
