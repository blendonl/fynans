import { Family } from '../../core/domain/entities/family.entity';

export class FamilyResponseDto {
  id: string;
  name: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(family: Family): FamilyResponseDto {
    const dto = new FamilyResponseDto();
    dto.id = family.id;
    dto.name = family.name;
    dto.balance = family.balance;
    dto.createdAt = family.createdAt;
    dto.updatedAt = family.updatedAt;
    return dto;
  }

  static fromEntities(families: Family[]): FamilyResponseDto[] {
    return families.map((f) => this.fromEntity(f));
  }
}
