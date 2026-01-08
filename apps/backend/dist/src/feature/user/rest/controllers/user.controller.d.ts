import { UserService } from '../../core/application/services/user.service';
import { UserResponseDto, UserSearchResponseDto } from '../dto/user-response.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    search(query: string, excludeFamilyId?: string): Promise<UserSearchResponseDto[]>;
    findOne(id: string): Promise<UserResponseDto>;
}
