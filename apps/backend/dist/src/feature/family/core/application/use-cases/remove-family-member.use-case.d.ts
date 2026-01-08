import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '~feature/user/core/application/services/user.service';
export declare class RemoveFamilyMemberUseCase {
    private readonly familyRepository;
    private readonly createNotificationUseCase;
    private readonly userService;
    constructor(familyRepository: IFamilyRepository, createNotificationUseCase: CreateNotificationUseCase, userService: UserService);
    execute(familyId: string, targetUserId: string, requestingUserId: string): Promise<void>;
}
