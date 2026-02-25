import { IsString, IsNumber, IsUUID, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateStoreItemRequestDto {
  @IsUUID()
  storeId: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  isDiscounted?: boolean;
}
