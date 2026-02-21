import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBasketItemRequestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0.001)
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ nullable: true, type: Number })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsString()
  @IsOptional()
  notes?: string | null;
}
