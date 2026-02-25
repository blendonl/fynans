import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class UpdateExpenseCategoryRequestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string | null;

  @IsBoolean()
  @IsOptional()
  isConnectedToStore?: boolean;
}
