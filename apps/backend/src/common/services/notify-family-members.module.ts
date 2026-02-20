import { Module, forwardRef } from '@nestjs/common';
import { FamilyCoreModule } from '~feature/family/core/family-core.module';
import { NotificationModule } from '~feature/notification/notification.module';
import { UserCoreModule } from '~feature/user/core/user-core.module';
import { NotifyFamilyMembersService } from './notify-family-members.service';

@Module({
  imports: [
    FamilyCoreModule,
    forwardRef(() => NotificationModule),
    UserCoreModule,
  ],
  providers: [NotifyFamilyMembersService],
  exports: [NotifyFamilyMembersService],
})
export class NotifyFamilyMembersModule {}
