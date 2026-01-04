import { Module, forwardRef } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { WebSocketAuthGuard } from './websocket-auth.guard';
import { AuthCoreModule } from '../../auth/core/auth-core.module';

@Module({
  imports: [AuthCoreModule],
  providers: [NotificationGateway, WebSocketAuthGuard],
  exports: [NotificationGateway],
})
export class NotificationWebSocketModule {}
