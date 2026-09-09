import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { CacheModule } from '~common/cache/cache.module';
import { AuthService } from './application/services/auth.service';
import { SessionCacheService } from './application/services/session-cache.service';
import { BetterAuthProvider } from './infrastructure/providers/better-auth.provider';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [BetterAuthProvider, AuthService, SessionCacheService],
  exports: [BetterAuthProvider, AuthService, SessionCacheService],
})
export class AuthCoreModule {}
