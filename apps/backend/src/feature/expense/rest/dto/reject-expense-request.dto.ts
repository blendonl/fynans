import { IsString, MinLength } from 'class-validator';

export class RejectExpenseRequestDto {
  @IsString()
  @MinLength(5)
  rejectionReason!: string;
}
