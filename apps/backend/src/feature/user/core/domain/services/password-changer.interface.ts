export const PASSWORD_CHANGER = 'PasswordChanger';

export interface ChangePasswordCommand {
  currentPassword: string;
  newPassword: string;
  sessionHeaders: Headers;
}

export interface ChangePasswordResult {
  sessionCookies: string[];
}

export interface IPasswordChanger {
  changePassword(command: ChangePasswordCommand): Promise<ChangePasswordResult>;
}
