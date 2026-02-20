import { Injectable, Inject } from '@nestjs/common';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { CreateFamilyDto } from '../dto/create-family.dto';
import { Family } from '../../domain/entities/family.entity';
import { FamilyMemberRole } from '../../domain/entities/family-member.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CreateFamilyUseCase {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(dto: CreateFamilyDto, ownerId: string): Promise<Family> {
    if (!dto.name?.trim()) {
      throw new DomainValidationException('Family name is required');
    }

    // Create family
    const family = await this.familyRepository.create({
      id: uuid(),
      name: dto.name.trim(),
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add creator as OWNER
    await this.familyRepository.addMember({
      id: uuid(),
      familyId: family.id,
      userId: ownerId,
      role: FamilyMemberRole.OWNER,
      balance: 0,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return family;
  }
}
