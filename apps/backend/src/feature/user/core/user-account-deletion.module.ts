import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { AuthCoreModule } from '../../auth/core/auth-core.module';
import { FamilyCoreModule } from '../../family/core/family-core.module';
import { PrismaAccountEraser } from './infrastructure/repositories/prisma-account-eraser';
import { BetterAuthAccountAuthenticator } from './infrastructure/services/better-auth-account-authenticator';
import { BetterAuthSessionRevoker } from './infrastructure/services/better-auth-session-revoker';
import { ACCOUNT_ERASER } from './domain/repositories/account-eraser.interface';
import { ACCOUNT_AUTHENTICATOR } from './domain/services/account-authenticator.interface';
import { SESSION_REVOKER } from './domain/services/session-revoker.interface';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case';

@Module({
  imports: [PrismaModule, AuthCoreModule, FamilyCoreModule],
  providers: [
    {
      provide: ACCOUNT_ERASER,
      useClass: PrismaAccountEraser,
    },
    {
      provide: ACCOUNT_AUTHENTICATOR,
      useClass: BetterAuthAccountAuthenticator,
    },
    {
      provide: SESSION_REVOKER,
      useClass: BetterAuthSessionRevoker,
    },
    DeleteAccountUseCase,
  ],
  exports: [DeleteAccountUseCase],
})
export class UserAccountDeletionModule {}
