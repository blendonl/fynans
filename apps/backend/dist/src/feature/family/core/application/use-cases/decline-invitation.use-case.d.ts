import { IFamilyInvitationRepository } from '../../domain/repositories/family-invitation.repository.interface';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '~feature/user/core/application/services/user.service';
export declare class DeclineInvitationUseCase {
    private readonly invitationRepository;
    private readonly familyRepository;
    private readonly createNotificationUseCase;
    private readonly userService;
    constructor(invitationRepository: IFamilyInvitationRepository, familyRepository: IFamilyRepository, createNotificationUseCase: CreateNotificationUseCase, userService: UserService);
    execute(invitationId: string, userId: string): Promise<void>;
}
