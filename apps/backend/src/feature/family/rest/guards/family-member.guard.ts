import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FamilyService } from '../../core/application/services/family.service';

@Injectable()
export class FamilyMemberGuard implements CanActivate {
  constructor(
    private readonly familyService: FamilyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const familyId = request.params.id || request.params.familyId;

    if (!familyId) {
      throw new BadRequestException('Family ID required');
    }

    const member = await this.familyService.findMember(familyId, user.id);
    if (!member) {
      throw new ForbiddenException('Not a member of this family');
    }

    // Attach member to request for use in controllers
    request.familyMember = member;
    return true;
  }
}
