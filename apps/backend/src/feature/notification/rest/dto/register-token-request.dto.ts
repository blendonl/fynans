import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterTokenRequestDto {
  @ApiProperty()
  expoPushToken!: string;

  @ApiPropertyOptional()
  platform?: string;

  @ApiPropertyOptional()
  deviceId?: string;

  @ApiPropertyOptional()
  deviceName?: string;
}
