import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
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
      throw new DomainNotFoundException(`Family with ID ${familyId} not found`);
    }

    return result;
  }
}
