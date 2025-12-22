import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateStoreItemCategoryRequestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
