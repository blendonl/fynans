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
  async getPreferences(@CurrentUser() user: User) {
    const preferences = await this.getPreferencesUseCase.execute(user.id);
    return preferences.toJSON();
  }

  @Put()
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
  async unregisterDevice(
    @Param('token') expoPushToken: string,
    @CurrentUser() user: User,
  ) {
    await this.unregisterTokenUseCase.execute(expoPushToken, user.id);
  }

  @Post('web-push/subscribe')
  @HttpCode(HttpStatus.CREATED)
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
  async unregisterWebPush(
    @Body() body: { endpoint: string },
    @CurrentUser() user: User,
  ) {
    await this.unregisterWebPushUseCase.execute(body.endpoint, user.id);
  }

  @Public()
  @Get('web-push/vapid-key')
  getVapidKey() {
    return { vapidKey: process.env.VAPID_PUBLIC_KEY || '' };
  }
}
