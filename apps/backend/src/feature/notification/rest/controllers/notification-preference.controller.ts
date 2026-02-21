import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { GetNotificationPreferencesUseCase } from '../../core/application/use-cases/get-notification-preferences.use-case';
import { UpdateNotificationPreferencesUseCase } from '../../core/application/use-cases/update-notification-preferences.use-case';
import { RegisterDeviceTokenUseCase } from '../../core/application/use-cases/register-device-token.use-case';
import { UnregisterDeviceTokenUseCase } from '../../core/application/use-cases/unregister-device-token.use-case';
import { RegisterWebPushSubscriptionUseCase } from '../../core/application/use-cases/register-web-push-subscription.use-case';
import { UnregisterWebPushSubscriptionUseCase } from '../../core/application/use-cases/unregister-web-push-subscription.use-case';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { Public } from '../../../auth/rest/decorators/public.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { UpdatePreferenceRequestDto } from '../dto/update-preference-request.dto';
import { RegisterTokenRequestDto } from '../dto/register-token-request.dto';
import { RegisterWebPushRequestDto } from '../dto/register-web-push-request.dto';

class NotificationPreferenceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  enablePushNotifications: boolean;

  @ApiProperty()
  enableInAppNotifications: boolean;

  @ApiProperty()
  enableToastNotifications: boolean;

  @ApiProperty()
  quietHoursEnabled: boolean;

  @ApiPropertyOptional()
  quietHoursStart?: Date;

  @ApiPropertyOptional()
  quietHoursEnd?: Date;

  @ApiProperty({ type: 'object', additionalProperties: true })
  typePreferences: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

class DeviceTokenResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  expoPushToken: string;

  @ApiPropertyOptional()
  platform?: string;

  @ApiPropertyOptional()
  deviceId?: string;

  @ApiPropertyOptional()
  deviceName?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastUsed: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

class WebPushSubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  endpoint: string;

  @ApiProperty()
  p256dh: string;

  @ApiProperty()
  auth: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastUsed: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

class VapidKeyResponseDto {
  @ApiProperty()
  vapidKey: string;
}

@ApiTags('Notification Preference')
@ApiBearerAuth('bearer')
@Controller('notification-preferences')
export class NotificationPreferenceController {
  constructor(
    private readonly getPreferencesUseCase: GetNotificationPreferencesUseCase,
    private readonly updatePreferencesUseCase: UpdateNotificationPreferencesUseCase,
    private readonly registerTokenUseCase: RegisterDeviceTokenUseCase,
    private readonly unregisterTokenUseCase: UnregisterDeviceTokenUseCase,
    private readonly registerWebPushUseCase: RegisterWebPushSubscriptionUseCase,
    private readonly unregisterWebPushUseCase: UnregisterWebPushSubscriptionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get notification preferences for the current user' })
  @ApiResponse({ status: 200, type: NotificationPreferenceResponseDto })
  async getPreferences(@CurrentUser() user: User) {
    const preferences = await this.getPreferencesUseCase.execute(user.id);
    return preferences.toJSON();
  }

  @Put()
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, type: NotificationPreferenceResponseDto })
  async updatePreferences(
    @Body() dto: UpdatePreferenceRequestDto,
    @CurrentUser() user: User,
  ) {
    const preferences = await this.updatePreferencesUseCase.execute({
      userId: user.id,
      ...dto,
    });
    return preferences.toJSON();
  }

  @Post('devices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a device token for push notifications' })
  @ApiResponse({ status: 201, type: DeviceTokenResponseDto })
  async registerDevice(
    @Body() dto: RegisterTokenRequestDto,
    @CurrentUser() user: User,
  ) {
    const token = await this.registerTokenUseCase.execute({
      userId: user.id,
      expoPushToken: dto.expoPushToken,
      platform: dto.platform,
      deviceId: dto.deviceId,
      deviceName: dto.deviceName,
    });
    return token.toJSON();
  }

  @Delete('devices/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unregister a device token' })
  @ApiResponse({ status: 204, description: 'Device token unregistered' })
  async unregisterDevice(
    @Param('token') expoPushToken: string,
    @CurrentUser() user: User,
  ) {
    await this.unregisterTokenUseCase.execute(expoPushToken, user.id);
  }

  @Post('web-push/subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a web push subscription' })
  @ApiResponse({ status: 201, type: WebPushSubscriptionResponseDto })
  async registerWebPush(
    @Body() dto: RegisterWebPushRequestDto,
    @CurrentUser() user: User,
  ) {
    const subscription = await this.registerWebPushUseCase.execute({
      userId: user.id,
      endpoint: dto.endpoint,
      p256dh: dto.p256dh,
      auth: dto.auth,
      userAgent: dto.userAgent,
    });
    return subscription.toJSON();
  }

  @Delete('web-push/subscribe')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unregister a web push subscription' })
  @ApiResponse({ status: 204, description: 'Web push subscription unregistered' })
  async unregisterWebPush(
    @Body() body: { endpoint: string },
    @CurrentUser() user: User,
  ) {
    await this.unregisterWebPushUseCase.execute(body.endpoint, user.id);
  }

  @Public()
  @Get('web-push/vapid-key')
  @ApiOperation({ summary: 'Get VAPID public key for web push subscriptions' })
  @ApiResponse({ status: 200, type: VapidKeyResponseDto })
  getVapidKey() {
    return { vapidKey: process.env.VAPID_PUBLIC_KEY || '' };
  }
}
