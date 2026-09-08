export class AuthResultDto {
  token!: string;
  user!: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  expiresAt!: Date;
}

export class AuthSessionDto {
  result!: AuthResultDto;
  sessionCookies!: string[];
}
