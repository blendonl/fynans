import { Module } from '@nestjs/common';
import { OnboardingCoreModule } from '../core/onboarding-core.module';
import { OnboardingController } from './controllers/onboarding.controller';

@Module({
  imports: [OnboardingCoreModule],
  controllers: [OnboardingController],
})
export class OnboardingRestModule {}
