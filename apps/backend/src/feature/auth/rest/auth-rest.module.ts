import { Module } from '@nestjs/common';
import { AuthCoreModule } from '../core/auth-core.module';
import { OnboardingCoreModule } from '~feature/onboarding/core/onboarding-core.module';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [AuthCoreModule, OnboardingCoreModule],
  controllers: [AuthController],
})
export class AuthRestModule {}
