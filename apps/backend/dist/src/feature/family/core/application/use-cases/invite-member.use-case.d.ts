import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { IFamilyInvitationRepository } from '../../domain/repositories/family-invitation.repository.interface';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { FamilyInvitation } from '../../domain/entities/family-invitation.entity';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '~feature/user/core/application/services/user.service';
export declare class InviteMemberUseCase {
    private readonly familyRepository;
    private readonly invitationRepository;
    private readonly createNotificationUseCase;
    private readonly userService;
    constructor(familyRepository: IFamilyRepository, invitationRepository: IFamilyInvitationRepository, createNotificationUseCase: CreateNotificationUseCase, userService: UserService);
    execute(dto: InviteMemberDto, inviterId: string): Promise<FamilyInvitation>;
}
