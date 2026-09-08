import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { AuthorizationModule } from '../../../common/authorization/authorization.module';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { GetVisibleUserUseCase } from './application/use-cases/get-visible-user.use-case';
import { UserService } from './application/services/user.service';

@Module({
  imports: [PrismaModule, AuthorizationModule],
  providers: [
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    GetVisibleUserUseCase,
    UserService,
  ],
  exports: [UserService],
})
export class UserCoreModule {}
