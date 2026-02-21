import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Notification } from '../../core/domain/entities/notification.entity';

export class NotificationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  priority!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  message!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  data?: Record<string, any>;

  @ApiProperty({ type: [String] })
  deliveryMethods!: string[];

  @ApiProperty()
  isRead!: boolean;

  @ApiPropertyOptional()
  readAt?: Date;

  @ApiProperty()
  isInteracted!: boolean;

  @ApiPropertyOptional()
  interactedAt?: Date;

  @ApiPropertyOptional()
  actionUrl?: string;

  @ApiPropertyOptional()
  familyId?: string;

  @ApiPropertyOptional()
  transactionId?: string;

  @ApiPropertyOptional()
  invitationId?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = notification.id;
    dto.userId = notification.userId;
    dto.type = notification.type;
    dto.priority = notification.priority;
    dto.title = notification.title;
    dto.message = notification.message;
    dto.data = notification.data;
    dto.deliveryMethods = notification.deliveryMethods;
    dto.isRead = notification.isRead;
    dto.readAt = notification.readAt;
    dto.isInteracted = notification.isInteracted;
    dto.interactedAt = notification.interactedAt;
    dto.actionUrl = notification.actionUrl;
    dto.familyId = notification.familyId;
    dto.transactionId = notification.transactionId;
    dto.invitationId = notification.invitationId;
    dto.createdAt = notification.createdAt;
    dto.updatedAt = notification.updatedAt;
    return dto;
  }
}
