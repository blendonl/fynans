import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { AuthCoreModule } from '../../auth/core/auth-core.module';

@Module({
  imports: [AuthCoreModule],
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationWebSocketModule {}
