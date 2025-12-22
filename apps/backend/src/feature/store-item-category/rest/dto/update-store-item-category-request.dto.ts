import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateStoreItemCategoryRequestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}
