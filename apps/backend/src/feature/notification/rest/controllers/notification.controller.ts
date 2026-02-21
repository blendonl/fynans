import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
  ApiQuery,
} from '@nestjs/swagger';
import { GetNotificationsUseCase } from '../../core/application/use-cases/get-notifications.use-case';
import { MarkNotificationAsReadUseCase } from '../../core/application/use-cases/mark-notification-as-read.use-case';
import { MarkAllAsReadUseCase } from '../../core/application/use-cases/mark-all-as-read.use-case';
import { GetUnreadCountUseCase } from '../../core/application/use-cases/get-unread-count.use-case';
import { DeleteNotificationUseCase } from '../../core/application/use-cases/delete-notification.use-case';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { NotificationResponseDto } from '../dto/notification-response.dto';

class PaginatedNotificationResponseDto {
  @ApiProperty({ type: () => [NotificationResponseDto] })
  data: NotificationResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

class UnreadCountResponseDto {
  @ApiProperty()
  count: number;
}

@ApiTags('Notification')
@ApiBearerAuth('bearer')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly markAllAsReadUseCase: MarkAllAsReadUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated notifications for the current user' })
  @ApiResponse({ status: 200, type: PaginatedNotificationResponseDto })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'unreadOnly', required: false, type: String })
  async getNotifications(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const parsedPage = page ? parseInt(page) : 1;
    const parsedLimit = limit ? parseInt(limit) : 20;

    const { data, total } = await this.getNotificationsUseCase.execute({
      userId: user.id,
      page: parsedPage,
      limit: parsedLimit,
      type,
      unreadOnly: unreadOnly === 'true',
    });

    return {
      data: data.map((n) => NotificationResponseDto.fromEntity(n)),
      total,
      page: parsedPage,
      limit: parsedLimit,
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, type: UnreadCountResponseDto })
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.getUnreadCountUseCase.execute(user.id);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 204, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    await this.markAsReadUseCase.execute(id, user.id);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 204, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    await this.markAllAsReadUseCase.execute(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  async deleteNotification(@Param('id') id: string, @CurrentUser() user: User) {
    await this.deleteNotificationUseCase.execute(id, user.id);
  }
}
