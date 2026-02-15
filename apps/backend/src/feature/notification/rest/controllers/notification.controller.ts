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
import { GetNotificationsUseCase } from '../../core/application/use-cases/get-notifications.use-case';
import { MarkNotificationAsReadUseCase } from '../../core/application/use-cases/mark-notification-as-read.use-case';
import { MarkAllAsReadUseCase } from '../../core/application/use-cases/mark-all-as-read.use-case';
import { GetUnreadCountUseCase } from '../../core/application/use-cases/get-unread-count.use-case';
import { DeleteNotificationUseCase } from '../../core/application/use-cases/delete-notification.use-case';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { NotificationResponseDto } from '../dto/notification-response.dto';

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
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.getUnreadCountUseCase.execute(user.id);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    await this.markAsReadUseCase.execute(id, user.id);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@CurrentUser() user: User) {
    await this.markAllAsReadUseCase.execute(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('id') id: string, @CurrentUser() user: User) {
    await this.deleteNotificationUseCase.execute(id, user.id);
  }
}
