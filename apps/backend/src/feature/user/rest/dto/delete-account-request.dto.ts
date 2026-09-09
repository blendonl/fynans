import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteAccountRequestDto {
  @ApiProperty({
    description:
      'The email address of the account being deleted, typed by the account holder as confirmation.',
  })
  @IsEmail()
  @IsNotEmpty()
  confirmEmail!: string;

  @ApiPropertyOptional({
    description:
      'Required for accounts that sign in with a password. Accounts created through Google or Apple have no password and confirm with the email address alone.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currentPassword?: string;
}
