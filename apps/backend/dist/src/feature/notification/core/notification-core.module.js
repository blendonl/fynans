"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../common/prisma/prisma.module");
const notification_websocket_module_1 = require("../websocket/notification-websocket.module");
const prisma_notification_repository_1 = require("./infrastructure/repositories/prisma-notification.repository");
const prisma_notification_preference_repository_1 = require("./infrastructure/repositories/prisma-notification-preference.repository");
const prisma_device_token_repository_1 = require("./infrastructure/repositories/prisma-device-token.repository");
const notification_template_service_1 = require("./application/services/notification-template.service");
const notification_preference_service_1 = require("./application/services/notification-preference.service");
const notification_delivery_service_1 = require("./application/services/notification-delivery.service");
const expo_push_notification_service_1 = require("./infrastructure/services/expo-push-notification.service");
const create_notification_use_case_1 = require("./application/use-cases/create-notification.use-case");
const get_notifications_use_case_1 = require("./application/use-cases/get-notifications.use-case");
const get_unread_count_use_case_1 = require("./application/use-cases/get-unread-count.use-case");
const mark_notification_as_read_use_case_1 = require("./application/use-cases/mark-notification-as-read.use-case");
const mark_all_as_read_use_case_1 = require("./application/use-cases/mark-all-as-read.use-case");
const delete_notification_use_case_1 = require("./application/use-cases/delete-notification.use-case");
const get_notification_preferences_use_case_1 = require("./application/use-cases/get-notification-preferences.use-case");
const update_notification_preferences_use_case_1 = require("./application/use-cases/update-notification-preferences.use-case");
const register_device_token_use_case_1 = require("./application/use-cases/register-device-token.use-case");
const unregister_device_token_use_case_1 = require("./application/use-cases/unregister-device-token.use-case");
let NotificationCoreModule = class NotificationCoreModule {
};
exports.NotificationCoreModule = NotificationCoreModule;
exports.NotificationCoreModule = NotificationCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, (0, common_1.forwardRef)(() => notification_websocket_module_1.NotificationWebSocketModule)],
        providers: [
            {
                provide: 'NotificationRepository',
                useClass: prisma_notification_repository_1.PrismaNotificationRepository,
            },
            {
                provide: 'NotificationPreferenceRepository',
                useClass: prisma_notification_preference_repository_1.PrismaNotificationPreferenceRepository,
            },
            {
                provide: 'DeviceTokenRepository',
                useClass: prisma_device_token_repository_1.PrismaDeviceTokenRepository,
            },
            notification_template_service_1.NotificationTemplateService,
            notification_preference_service_1.NotificationPreferenceService,
            notification_delivery_service_1.NotificationDeliveryService,
            expo_push_notification_service_1.ExpoPushNotificationService,
            create_notification_use_case_1.CreateNotificationUseCase,
            get_notifications_use_case_1.GetNotificationsUseCase,
            get_unread_count_use_case_1.GetUnreadCountUseCase,
            mark_notification_as_read_use_case_1.MarkNotificationAsReadUseCase,
            mark_all_as_read_use_case_1.MarkAllAsReadUseCase,
            delete_notification_use_case_1.DeleteNotificationUseCase,
            get_notification_preferences_use_case_1.GetNotificationPreferencesUseCase,
            update_notification_preferences_use_case_1.UpdateNotificationPreferencesUseCase,
            register_device_token_use_case_1.RegisterDeviceTokenUseCase,
            unregister_device_token_use_case_1.UnregisterDeviceTokenUseCase,
        ],
        exports: [
            create_notification_use_case_1.CreateNotificationUseCase,
            get_notifications_use_case_1.GetNotificationsUseCase,
            get_unread_count_use_case_1.GetUnreadCountUseCase,
            mark_notification_as_read_use_case_1.MarkNotificationAsReadUseCase,
            mark_all_as_read_use_case_1.MarkAllAsReadUseCase,
            delete_notification_use_case_1.DeleteNotificationUseCase,
            get_notification_preferences_use_case_1.GetNotificationPreferencesUseCase,
            update_notification_preferences_use_case_1.UpdateNotificationPreferencesUseCase,
            register_device_token_use_case_1.RegisterDeviceTokenUseCase,
            unregister_device_token_use_case_1.UnregisterDeviceTokenUseCase,
            notification_delivery_service_1.NotificationDeliveryService,
        ],
    })
], NotificationCoreModule);
//# sourceMappingURL=notification-core.module.js.map