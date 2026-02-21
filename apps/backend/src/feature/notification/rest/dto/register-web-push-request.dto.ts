import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterWebPushRequestDto {
  @ApiProperty()
  endpoint!: string;

  @ApiProperty()
  p256dh!: string;

  @ApiProperty()
  auth!: string;

  @ApiPropertyOptional()
  userAgent?: string;
}
