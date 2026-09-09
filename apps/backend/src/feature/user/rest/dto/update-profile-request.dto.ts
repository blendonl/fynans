import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const MAX_NAME_LENGTH = 100;
const MAX_IMAGE_LENGTH = 2048;

export class UpdateProfileRequestDto {
  @ApiPropertyOptional({ maxLength: MAX_NAME_LENGTH })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_NAME_LENGTH)
  firstName?: string;

  @ApiPropertyOptional({ maxLength: MAX_NAME_LENGTH })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_NAME_LENGTH)
  lastName?: string;

  @ApiPropertyOptional({
    nullable: true,
    maxLength: MAX_IMAGE_LENGTH,
    description: 'Absolute http(s) avatar URL, or null to clear it',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(MAX_IMAGE_LENGTH)
  image?: string | null;
}
