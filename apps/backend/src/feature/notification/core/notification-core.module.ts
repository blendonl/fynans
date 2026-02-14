import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { NotificationWebSocketModule } from '../websocket/notification-websocket.module';

// Repositories
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository';
import { PrismaNotificationPreferenceRepository } from './infrastructure/repositories/prisma-notification-preference.repository';
import { PrismaDeviceTokenRepository } from './infrastructure/repositories/prisma-device-token.repository';
import { PrismaWebPushSubscriptionRepository } from './infrastructure/repositories/prisma-web-push-subscription.repository';

// Services
import { NotificationTemplateService } from './application/services/notification-template.service';
import { NotificationPreferenceService } from './application/services/notification-preference.service';
import { NotificationDeliveryService } from './application/services/notification-delivery.service';
import { ExpoPushNotificationService } from './infrastructure/services/expo-push-notification.service';
import { WebPushNotificationService } from './infrastructure/services/web-push-notification.service';

// Use Cases
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { GetUnreadCountUseCase } from './application/use-cases/get-unread-count.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read.use-case';
import { MarkAllAsReadUseCase } from './application/use-cases/mark-all-as-read.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { GetNotificationPreferencesUseCase } from './application/use-cases/get-notification-preferences.use-case';
import { UpdateNotificationPreferencesUseCase } from './application/use-cases/update-notification-preferences.use-case';
import { RegisterDeviceTokenUseCase } from './application/use-cases/register-device-token.use-case';
import { UnregisterDeviceTokenUseCase } from './application/use-cases/unregister-device-token.use-case';
import { RegisterWebPushSubscriptionUseCase } from './application/use-cases/register-web-push-subscription.use-case';
import { UnregisterWebPushSubscriptionUseCase } from './application/use-cases/unregister-web-push-subscription.use-case';

@Module({
  imports: [PrismaModule, forwardRef(() => NotificationWebSocketModule)],
  providers: [
    // Repositories
    {
      provide: 'NotificationRepository',
      useClass: PrismaNotificationRepository,
    },
    {
      provide: 'NotificationPreferenceRepository',
      useClass: PrismaNotificationPreferenceRepository,
    },
    {
      provide: 'DeviceTokenRepository',
      useClass: PrismaDeviceTokenRepository,
    },
    {
      provide: 'WebPushSubscriptionRepository',
      useClass: PrismaWebPushSubscriptionRepository,
    },

    // Services
    NotificationTemplateService,
    NotificationPreferenceService,
    NotificationDeliveryService,
    ExpoPushNotificationService,
    WebPushNotificationService,

    // Use Cases
    CreateNotificationUseCase,
    GetNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllAsReadUseCase,
    DeleteNotificationUseCase,
    GetNotificationPreferencesUseCase,
    UpdateNotificationPreferencesUseCase,
    RegisterDeviceTokenUseCase,
    UnregisterDeviceTokenUseCase,
    RegisterWebPushSubscriptionUseCase,
    UnregisterWebPushSubscriptionUseCase,
  ],
  exports: [
    // Export use cases for other modules
    CreateNotificationUseCase,
    GetNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllAsReadUseCase,
    DeleteNotificationUseCase,
    GetNotificationPreferencesUseCase,
    UpdateNotificationPreferencesUseCase,
    RegisterDeviceTokenUseCase,
    UnregisterDeviceTokenUseCase,
    RegisterWebPushSubscriptionUseCase,
    UnregisterWebPushSubscriptionUseCase,

    // Export services for other modules
    NotificationDeliveryService,
  ],
})
export class NotificationCoreModule {}
