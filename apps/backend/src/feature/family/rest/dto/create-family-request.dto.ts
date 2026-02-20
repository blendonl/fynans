import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { CreateFamilyDto } from '../../core/application/dto/create-family.dto';

export class CreateFamilyRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  toCoreDto(): CreateFamilyDto {
    return new CreateFamilyDto(this.name);
  }
}
