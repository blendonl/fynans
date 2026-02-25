import { IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateStoreItemRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isDiscounted?: boolean;
}
