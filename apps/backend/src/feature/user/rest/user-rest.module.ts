import { Module } from '@nestjs/common';
import { UserCoreModule } from '../core/user-core.module';
import { UserAccountDeletionModule } from '../core/user-account-deletion.module';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [UserCoreModule, UserAccountDeletionModule],
  controllers: [UserController],
})
export class UserRestModule {}
