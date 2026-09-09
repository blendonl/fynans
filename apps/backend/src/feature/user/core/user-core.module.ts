import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { AuthorizationModule } from '../../../common/authorization/authorization.module';
import { AuthCoreModule } from '../../auth/core/auth-core.module';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { BetterAuthPasswordChanger } from './infrastructure/services/better-auth-password-changer';
import { PASSWORD_CHANGER } from './domain/services/password-changer.interface';
import { GetVisibleUserUseCase } from './application/use-cases/get-visible-user.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { UserService } from './application/services/user.service';

@Module({
  imports: [PrismaModule, AuthorizationModule, AuthCoreModule],
  providers: [
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: PASSWORD_CHANGER,
      useClass: BetterAuthPasswordChanger,
    },
    GetVisibleUserUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    UserService,
  ],
  exports: [UserService],
})
export class UserCoreModule {}
