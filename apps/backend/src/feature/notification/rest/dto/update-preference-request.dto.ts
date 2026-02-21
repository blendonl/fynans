import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferenceRequestDto {
  @ApiPropertyOptional()
  enablePushNotifications?: boolean;

  @ApiPropertyOptional()
  enableInAppNotifications?: boolean;

  @ApiPropertyOptional()
  enableToastNotifications?: boolean;

  @ApiPropertyOptional()
  quietHoursEnabled?: boolean;

  @ApiPropertyOptional()
  quietHoursStart?: Date;

  @ApiPropertyOptional()
  quietHoursEnd?: Date;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  typePreferences?: Record<string, any>;
}
