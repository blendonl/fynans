import { ApiProperty } from '@nestjs/swagger';
import { Family } from '../../core/domain/entities/family.entity';

export class FamilyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(family: Family): FamilyResponseDto {
    return {
      id: family.id,
      name: family.name,
      balance: family.balance,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt,
    };
  }

  static fromEntities(families: Family[]): FamilyResponseDto[] {
    return families.map((f) => this.fromEntity(f));
  }
}
