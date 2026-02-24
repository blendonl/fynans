import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  async execute(
    familyId: string,
    userId: string,
  ): Promise<FamilyWithMembersAndUsers> {
    const result = await this.familyRepository.findByIdWithMembers(familyId);

    if (!result) {
      throw new NotFoundException(`Family with ID ${familyId} not found`);
    }

    const isUserMember = result.membersWithUsers.some(
      ({ member }) => member.userId === userId,
    );

    if (!isUserMember) {
      throw new ForbiddenException(
        'You must be a member of this family to view its details',
      );
    }

    return result;
  }
}
