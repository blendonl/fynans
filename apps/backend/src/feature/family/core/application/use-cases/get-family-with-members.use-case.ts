import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IFamilyRepository,
  FamilyWithMembersAndUsers,
} from '../../domain/repositories/family.repository.interface';

@Injectable()
export class GetFamilyWithMembersUseCase {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(familyId: string): Promise<FamilyWithMembersAndUsers> {
    const result = await this.familyRepository.findByIdWithMembers(familyId);

    if (!result) {
      throw new NotFoundException(`Family with ID ${familyId} not found`);
    }

    return result;
  }
}
