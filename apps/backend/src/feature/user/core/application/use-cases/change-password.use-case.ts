import { Inject, Injectable } from '@nestjs/common';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
import {
  ChangePasswordResult,
  type IPasswordChanger,
  PASSWORD_CHANGER,
} from '../../domain/services/password-changer.interface';

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  sessionHeaders: Headers;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(PASSWORD_CHANGER)
    private readonly passwordChanger: IPasswordChanger,
  ) {}

  async execute(input: ChangePasswordInput): Promise<ChangePasswordResult> {
    if (input.currentPassword === input.newPassword) {
      throw new DomainValidationException(
        'New password must be different from the current password',
      );
    }

    return this.passwordChanger.changePassword({
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      sessionHeaders: input.sessionHeaders,
    });
  }
}
