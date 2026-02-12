import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { AuthService } from './application/services/auth.service';
import { BetterAuthProvider } from './infrastructure/providers/better-auth.provider';

@Module({
  imports: [PrismaModule],
  providers: [BetterAuthProvider, AuthService],
  exports: [BetterAuthProvider, AuthService],
})
export class AuthCoreModule {}
