import { ApiProperty } from '@nestjs/swagger';
import { OnboardingStatus } from '../../core/application/use-cases/get-onboarding-status.use-case';

export class OnboardingStatusResponseDto {
  @ApiProperty()
  hasExpenseCategories: boolean;

  @ApiProperty()
  hasIncomeCategories: boolean;

  @ApiProperty()
  hasItemCategories: boolean;

  @ApiProperty()
  hasPaymentMethods: boolean;

  static fromStatus(status: OnboardingStatus): OnboardingStatusResponseDto {
    const dto = new OnboardingStatusResponseDto();
    dto.hasExpenseCategories = status.hasExpenseCategories;
    dto.hasIncomeCategories = status.hasIncomeCategories;
    dto.hasItemCategories = status.hasItemCategories;
    dto.hasPaymentMethods = status.hasPaymentMethods;
    return dto;
  }
}
